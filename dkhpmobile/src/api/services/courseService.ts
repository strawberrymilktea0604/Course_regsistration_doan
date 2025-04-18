import apiClient from '../config/api-config';

// Define interfaces for type safety
export interface CourseOfferingModel {
  offering_id: number;
  course_id: number;
  code: string;
  title: string;
  description?: string;
  credits: number;
  category_name?: string;
  section_number: string;
  max_enrollment: number;
  current_enrollment: number;
  term_name: string;
  term_id: number;
  available_seats: number;
  building?: string;
  room_number?: string;
  professor_name?: string;
}

export interface AcademicTermModel {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
}

export interface CurriculumCourseModel {
  id: number;
  code: string;
  title: string;
  credits: number;
  description?: string;
  category_name?: string;
  is_required: boolean;
  prerequisite_courses?: string;
}

export interface SemesterModel {
  id: number;
  name: string;
  sequence: number;
  credits: number;
  courses: CurriculumCourseModel[];
}

export interface CurriculumFrameworkModel {
  totalCredits: number;
  program: {
    id: number;
    name: string;
  } | null;
  major: {
    id: number;
    name: string;
  } | null;
  semesters: SemesterModel[];
}

export interface MajorModel {
  id: number;
  name: string;
  code: string;
  program_id: number;
  program_name: string;
  program_code: string;
}

/**
 * Service for fetching course-related data from the API
 */
const courseService = {
  /**
   * Get all available courses for registration
   * @param termId - Optional term ID to filter courses by term
   * @returns A promise that resolves to an array of available course offerings
   */
  getAvailableCourses: async (termId?: number): Promise<CourseOfferingModel[]> => {
    try {
      const params = termId ? { termId } : {};
      const response = await apiClient.get('/courses/available', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available courses:', error);
      throw error;
    }
  },

  /**
   * Get all available courses for registration in a specific semester
   * @param semesterId - The ID of the semester to filter courses by
   * @returns A promise that resolves to an array of available course offerings for the specified semester
   */
  getAvailableCoursesBySemester: async (semesterId: number): Promise<CourseOfferingModel[]> => {
    try {
      const response = await apiClient.get('/courses/available-by-semester', { 
        params: { semesterId } 
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching available courses for semester ID ${semesterId}:`, error);
      throw error;
    }
  },

  /**
   * Get all active academic terms
   * @returns A promise that resolves to an array of active academic terms
   */
  getActiveTerms: async (): Promise<AcademicTermModel[]> => {
    try {
      const response = await apiClient.get('/courses/terms');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active terms:', error);
      throw error;
    }
  },

  /**
   * Get detailed information about a specific course offering
   * @param offeringId - The ID of the course offering
   * @returns A promise that resolves to the course offering details
   */
  getCourseOfferingDetails: async (offeringId: number): Promise<CourseOfferingModel> => {
    try {
      const response = await apiClient.get(`/course-offerings/${offeringId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching course offering details for ID ${offeringId}:`, error);
      throw error;
    }
  },

  /**
   * Get all courses (not just available ones)
   * @returns A promise that resolves to an array of all courses
   */
  getAllCourses: async () => {
    try {
      const response = await apiClient.get('/courses');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      throw error;
    }
  },

  /**
   * Search courses by various criteria
   * @param params - Search parameters
   * @returns A promise that resolves to the search results
   */
  searchCourses: async (params: { code?: string, title?: string, category_id?: number, credits?: number }) => {
    try {
      const response = await apiClient.get('/courses/search', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  },

  /**
   * Get curriculum framework (Chương trình khung)
   * @param majorId - Optional major ID to filter by specific major
   * @param programId - Optional program ID to filter by specific program
   * @returns A promise that resolves to the curriculum framework data
   */
  getCurriculumFramework: async (majorId?: number, programId?: number): Promise<CurriculumFrameworkModel> => {
    try {
      const params: Record<string, any> = {};
      if (majorId) params.major_id = majorId;
      if (programId) params.program_id = programId;

      const response = await apiClient.get('/courses/curriculum', { params });
      
      // Make sure we're properly parsing the data
      if (response.data && response.data.success && response.data.data) {
        // Extract the data object
        const curriculumData = response.data.data;
        
        // Check if semesters exist in the response
        if (!curriculumData.semesters || !Array.isArray(curriculumData.semesters)) {
          throw new Error('Invalid curriculum data: missing or invalid semesters array');
        }
        
        // Process each semester to ensure courses array is properly formatted
        curriculumData.semesters = curriculumData.semesters.map((semester: any) => {
          // Make sure courses is an array
          if (!semester.courses || !Array.isArray(semester.courses)) {
            semester.courses = [];
          }
          return semester;
        });
        
        return curriculumData;
      }
      
      throw new Error('Invalid curriculum data received from server');
    } catch (error) {
      console.error('Error fetching curriculum framework:', error);
      throw error;
    }
  },

  /**
   * Get list of all available majors
   * @returns A promise that resolves to an array of majors
   */
  getMajors: async (): Promise<MajorModel[]> => {
    try {
      const response = await apiClient.get('/courses/majors');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching majors:', error);
      throw error;
    }
  }
};

export default courseService;