"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StudentData = any;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  uuid: string | null;
  studentData: StudentData;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchExamData: (id: string) => Promise<unknown>;
  fetchStudentInfo: () => Promise<unknown>;
  fetchCCGrades: (cardId: string) => Promise<unknown>;
  fetchExamGrades: (cardId: string) => Promise<unknown>;
  fetchStudentPhoto: () => Promise<string | null>;
  fetchSubjects: (offerId: string, levelId: string) => Promise<unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


function decodeJwtPayload(token: string): { exp?: number;[key: string]: unknown } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}


function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  return Date.now() >= (payload.exp * 1000) - 30000;
}


function getTokenExpiresIn(token: string): number {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return 0;
  return (payload.exp * 1000) - Date.now();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData>(null);
  const router = useRouter();


  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isRefreshingRef = useRef(false);


  const handleForceLogout = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("uuid");
    localStorage.removeItem("studentData");
    setToken(null);
    setUuid(null);
    setStudentData(null);
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);


  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshingRef.current) {
      return null;
    }

    isRefreshingRef.current = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // IMPORTANT: Send cookies with request
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Only store access token in localStorage (refresh token is in httpOnly cookie)
      localStorage.setItem("token", data.token);
      setToken(data.token);

      return data.token;

    } catch (error) {
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);


  const scheduleTokenRefresh = useCallback((accessToken: string) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expiresIn = getTokenExpiresIn(accessToken);

    const refreshIn = Math.max(expiresIn - 120000, 10000);

    refreshTimerRef.current = setTimeout(async () => {
      const newToken = await refreshAccessToken();
      if (newToken) {
        scheduleTokenRefresh(newToken);
      } else {
        handleForceLogout();
      }
    }, refreshIn);
  }, [refreshAccessToken, handleForceLogout]);


  const authenticatedFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    // ... (unchanged)
    let currentToken = token || localStorage.getItem("token");

    // Check if token is expired, try to refresh first
    if (currentToken && isTokenExpired(currentToken)) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        currentToken = newToken;
        scheduleTokenRefresh(newToken);
      } else {
        handleForceLogout();
        throw new Error("Session expired. Please login again.");
      }
    }

    const response = await fetch(url, {
      ...options,
      credentials: "include", // Always include cookies
      headers: {
        ...options.headers,
        Authorization: `Bearer ${currentToken}`,
      },
    });

    // If 401, try refresh and retry once
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        scheduleTokenRefresh(newToken);
        return fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } else {
        handleForceLogout();
        throw new Error("Session expired. Please login again.");
      }
    }

    return response;
  }, [token, refreshAccessToken, scheduleTokenRefresh, handleForceLogout]);


  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUuid = localStorage.getItem("uuid");
      const storedStudentData = localStorage.getItem("studentData");

      if (storedToken && storedStudentData) {
        if (!isTokenExpired(storedToken)) {
          // Access token still valid
          setToken(storedToken);
          setUuid(storedUuid);

          setStudentData(JSON.parse(storedStudentData));
          setIsAuthenticated(true);
          scheduleTokenRefresh(storedToken);
        } else {
          // Access token expired - try to refresh using httpOnly cookie
          setUuid(storedUuid);

          setStudentData(JSON.parse(storedStudentData));

          const newToken = await refreshAccessToken();
          if (newToken) {
            setToken(newToken);
            setIsAuthenticated(true);
            scheduleTokenRefresh(newToken);
          } else {
            // Refresh failed - clean up and stay logged out
            localStorage.removeItem("token");
            localStorage.removeItem("uuid");
            localStorage.removeItem("studentData");
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleTokenRefresh, refreshAccessToken]);


  const login = async (username: string, password: string) => {
    try {
      const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // IMPORTANT: Receive and store cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authData.message || "فشل تسجيل الدخول");
      }

      if (!authData.token || !authData.uuid) {
        throw new Error("استجابة المصادقة تفتقد إلى الرمز أو المعرف الفريد.");
      }

      const jwtToken = authData.token;

      // Fetch student data
      const studentResponse = await fetch(`${API_BASE_URL}/student/data`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      });

      const fetchedStudentData = await studentResponse.json();

      if (!studentResponse.ok) {
        throw new Error(
          fetchedStudentData.message || "فشل في جلب بيانات الطالب",
        );
      }

      // Store access token and data (refresh token is in httpOnly cookie)
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("uuid", authData.uuid);
      localStorage.setItem("studentData", JSON.stringify(fetchedStudentData));

      // Update state
      setToken(jwtToken);
      setUuid(authData.uuid);
      setStudentData(fetchedStudentData);
      setIsAuthenticated(true);

      // Schedule automatic token refresh
      scheduleTokenRefresh(jwtToken);

      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };


  const fetchExamData = async (id: string) => {
    if (!token && !localStorage.getItem("token")) {
      throw new Error("Not authenticated");
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/student/exams/${id}`);

    if (!response.ok) {
      const text = await response.text();
      if (text) {
        try {
          const error = JSON.parse(text);
          throw new Error(error.message || "Failed to fetch exam data");
        } catch {
          throw new Error(`Failed to fetch exam data: ${response.status}`);
        }
      }
      throw new Error(`Failed to fetch exam data: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    try {
      return JSON.parse(text);
    } catch {
      return [];
    }
  };


  const fetchStudentInfo = async () => {
    if (!token && !localStorage.getItem("token")) {
      throw new Error("Not authenticated");
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/student/info`);

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        throw new Error(error.message || "Failed to fetch student info");
      } catch {
        throw new Error(`Failed to fetch student info: ${response.status}`);
      }
    }

    return await response.json();
  };


  const fetchCCGrades = async (cardId: string) => {
    if (!token && !localStorage.getItem("token")) {
      throw new Error("Not authenticated");
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/student/cc-grades/${cardId}`);

    if (!response.ok) {
      const text = await response.text();
      if (text) {
        try {
          const error = JSON.parse(text);
          throw new Error(error.message || "Failed to fetch CC grades");
        } catch {
          throw new Error(`Failed to fetch CC grades: ${response.status}`);
        }
      }
      throw new Error(`Failed to fetch CC grades: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    try {
      return JSON.parse(text);
    } catch {
      return [];
    }
  };


  const fetchExamGrades = async (cardId: string) => {
    if (!token && !localStorage.getItem("token")) {
      throw new Error("Not authenticated");
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/student/exam-grades/${cardId}`);

    if (!response.ok) {
      const text = await response.text();
      if (text) {
        try {
          const error = JSON.parse(text);
          throw new Error(error.message || "Failed to fetch exam grades");
        } catch {
          throw new Error(`Failed to fetch exam grades: ${response.status}`);
        }
      }
      throw new Error(`Failed to fetch exam grades: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    try {
      return JSON.parse(text);
    } catch {
      return [];
    }
  };


  const fetchStudentPhoto = async (): Promise<string | null> => {
    if (!token && !localStorage.getItem("token")) {
      throw new Error("Not authenticated");
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/student/photo`);

    if (!response.ok) {
      // If 404, just return null (no photo)
      if (response.status === 404) return null;

      const text = await response.text();
      try {
        const error = JSON.parse(text);
        throw new Error(error.message || "Failed to fetch student photo");
      } catch {
        throw new Error(`Failed to fetch student photo: ${response.status}`);
      }
    }

    // Expecting base64 string
    const text = await response.text();
    return text || null;
  };


  const fetchSubjects = async (offerId: string, levelId: string) => {
    if (!token && !localStorage.getItem("token")) {
      throw new Error("Not authenticated");
    }

    const response = await authenticatedFetch(
      `${API_BASE_URL}/student/subjects/${offerId}/${levelId}`
    );

    if (!response.ok) {
      const text = await response.text();
      if (text) {
        try {
          const error = JSON.parse(text);
          throw new Error(error.message || "Failed to fetch subjects");
        } catch {
          throw new Error(`Failed to fetch subjects: ${response.status}`);
        }
      }
      throw new Error(`Failed to fetch subjects: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return [];
    }

    try {
      return JSON.parse(text);
    } catch {
      return [];
    }
  };


  const logout = async () => {
    // Clear refresh timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Call logout endpoint - this clears the httpOnly cookie on server side
    const currentToken = token || localStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Send cookie so server can clear it
        headers: {
          Authorization: currentToken ? `Bearer ${currentToken}` : "",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Ignore logout errors
    }

    // Clear local storage and state
    localStorage.removeItem("token");
    localStorage.removeItem("uuid");
    localStorage.removeItem("studentData");
    setToken(null);
    setUuid(null);
    setStudentData(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        uuid,
        studentData,
        login,
        logout,
        fetchExamData,
        fetchStudentInfo,
        fetchCCGrades,
        fetchExamGrades,
        fetchStudentPhoto,
        fetchSubjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
