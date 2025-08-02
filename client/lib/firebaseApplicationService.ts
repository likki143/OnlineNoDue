import {
  ref,
  set,
  get,
  push,
  query,
  orderByChild,
  equalTo,
  update,
  remove,
} from "firebase/database";
import { database, auth } from "./firebase";
import { Application } from "./applicationStore";
import { sendCertificateReadyEmail } from "./utils/emailService";

export class FirebaseApplicationService {
  private readonly APPLICATIONS_PATH = "applications";

  // Get current user's UID with validation
  private getCurrentUserUid(): string {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be logged in to access applications");
    }
    return user.uid;
  }

  // Submit a new application
  async submitApplication(
    application: Omit<
      Application,
      "id" | "submissionDate" | "status" | "progress"
    >,
  ): Promise<Application> {
    try {
      const userUid = this.getCurrentUserUid();

      // Ensure the application belongs to the current user
      if (application.studentId !== userUid) {
        throw new Error(
          "Access denied: Cannot submit application for another user",
        );
      }

      // Check if user already has an application
      const canApply = await this.canStudentApply(userUid);
      if (!canApply) {
        throw new Error(
          "You have already submitted an application. Only one application per student is allowed.",
        );
      }

      // Create the new application - filter out undefined values
      const newApplication: Application = {
        ...application,
        id: Date.now().toString(),
        submissionDate: new Date().toISOString().split("T")[0],
        status: "pending",
        progress: {
          library: "pending",
          hostel: "pending",
          accounts: "pending",
          lab: "pending",
          sports: "pending",
        },
        // Only include documents if they exist and have valid values
        ...(application.documents && Object.keys(application.documents).length > 0 && {
          documents: {
            ...(application.documents.idCard && { idCard: application.documents.idCard }),
            ...(application.documents.supportingDocs && { supportingDocs: application.documents.supportingDocs }),
          }
        }),
      };

      // Use push to generate a unique key and store under user's UID
      const userApplicationsRef = ref(
        database,
        `${this.APPLICATIONS_PATH}/${userUid}`,
      );
      const newApplicationRef = push(userApplicationsRef);

      // Update the application ID to match the Firebase key
      newApplication.id = newApplicationRef.key!;

      // Save to Firebase
      await set(newApplicationRef, newApplication);

      console.log("Application submitted to Firebase:", newApplication);
      return newApplication;
    } catch (error) {
      console.error("Error submitting application to Firebase:", error);
      throw error;
    }
  }

  // Get applications for the current user
  async getApplicationsByStudentId(studentId?: string): Promise<Application[]> {
    try {
      const userUid = studentId || this.getCurrentUserUid();

      // Ensure user can only access their own applications
      if (studentId && studentId !== this.getCurrentUserUid()) {
        // Only allow if current user is admin (this would need proper role checking in production)
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error(
            "Access denied: Cannot access other user applications",
          );
        }
        // In production, you'd check if current user has admin role here
      }

      const userApplicationsRef = ref(
        database,
        `${this.APPLICATIONS_PATH}/${userUid}`,
      );
      const snapshot = await get(userApplicationsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const applicationsData = snapshot.val();
      return Object.values(applicationsData) as Application[];
    } catch (error) {
      console.error("Error fetching applications from Firebase:", error);
      return [];
    }
  }

  // Check if student can apply (only one application allowed)
  async canStudentApply(studentId?: string): Promise<boolean> {
    try {
      const userUid = studentId || this.getCurrentUserUid();
      const applications = await this.getApplicationsByStudentId(userUid);
      return applications.length === 0;
    } catch (error) {
      console.error("Error checking if student can apply:", error);
      return false;
    }
  }

  // Get student application status
  async getStudentApplicationStatus(
    studentId?: string,
  ): Promise<"none" | "pending" | "in_progress" | "approved" | "rejected"> {
    try {
      const userUid = studentId || this.getCurrentUserUid();
      const applications = await this.getApplicationsByStudentId(userUid);

      if (applications.length === 0) {
        return "none";
      }

      // Return the status of the first (and should be only) application
      return applications[0].status;
    } catch (error) {
      console.error("Error getting student application status:", error);
      return "none";
    }
  }

  // Update application status (for department officers and admins)
  async updateApplicationStatus(
    applicationId: string,
    departmentStatus: Partial<Application["progress"]>,
    studentId?: string,
  ): Promise<void> {
    try {
      const userUid = studentId || this.getCurrentUserUid();
      const applicationRef = ref(
        database,
        `${this.APPLICATIONS_PATH}/${userUid}/${applicationId}`,
      );

      // Get current application
      const snapshot = await get(applicationRef);
      if (!snapshot.exists()) {
        throw new Error("Application not found");
      }

      const currentApp = snapshot.val() as Application;

      // Update progress
      const updatedProgress = {
        ...currentApp.progress,
        ...departmentStatus,
      };

      // Determine overall status
      const statuses = Object.values(updatedProgress);
      let newStatus: Application["status"];

      const wasFullyApproved = currentApp.status === "approved";

      if (statuses.every((status) => status === "approved")) {
        newStatus = "approved";

        // Send certificate ready email if this is the first time it's fully approved
        if (!wasFullyApproved) {
          try {
            await sendCertificateReadyEmail({
              studentName: currentApp.studentName,
              studentEmail: currentApp.email,
              applicationId: currentApp.id,
            });
          } catch (emailError) {
            console.log("Certificate ready email failed:", emailError);
          }
        }
      } else if (statuses.some((status) => status === "rejected")) {
        // Check if ALL departments have been processed
        const allProcessed = statuses.every((status) => status !== "pending");
        if (allProcessed) {
          // If all departments have been processed and some are rejected, mark as partially rejected
          newStatus = "partially_rejected";
        } else {
          // Still waiting for some departments
          newStatus = "in_progress";
        }
      } else if (statuses.some((status) => status === "approved")) {
        newStatus = "in_progress";
      } else {
        newStatus = "pending";
      }

      // Update in Firebase
      await update(applicationRef, {
        progress: updatedProgress,
        status: newStatus,
      });

      console.log("Application status updated in Firebase");
    } catch (error) {
      console.error("Error updating application status in Firebase:", error);
      throw error;
    }
  }

  // Get all applications (admin only - for viewing all applications)
  async getAllApplications(): Promise<Application[]> {
    try {
      // In production, you should verify admin role here
      const applicationsRef = ref(database, this.APPLICATIONS_PATH);
      const snapshot = await get(applicationsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const allApplicationsData = snapshot.val();
      const allApplications: Application[] = [];

      // Flatten the nested structure
      Object.values(allApplicationsData).forEach((userApplications: any) => {
        if (userApplications && typeof userApplications === "object") {
          Object.values(userApplications).forEach((app: any) => {
            if (app && typeof app === "object") {
              allApplications.push(app as Application);
            }
          });
        }
      });

      return allApplications;
    } catch (error) {
      console.error("Error fetching all applications from Firebase:", error);
      return [];
    }
  }

  // Delete an application (if needed)
  async deleteApplication(
    applicationId: string,
    studentId?: string,
  ): Promise<void> {
    try {
      const userUid = studentId || this.getCurrentUserUid();
      const applicationRef = ref(
        database,
        `${this.APPLICATIONS_PATH}/${userUid}/${applicationId}`,
      );
      await remove(applicationRef);
      console.log("Application deleted from Firebase");
    } catch (error) {
      console.error("Error deleting application from Firebase:", error);
      throw error;
    }
  }
}

export const firebaseApplicationService = new FirebaseApplicationService();
