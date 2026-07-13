import { z } from "zod";

const experienceSchema = z.object({
  id: z.string().min(1),
  role: z.string(),
  company: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  bullets: z.array(z.string()),
});

const educationSchema = z.object({
  id: z.string().min(1),
  degree: z.string(),
  school: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  details: z.string(),
});

const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string(),
  link: z.string(),
});

const certificationSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  issuer: z.string(),
  year: z.string(),
});

export const resumeDataSchema = z.object({
  template: z.enum(["classic", "modern"]),
  contact: z.object({
    fullName: z.string(),
    headline: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    website: z.string(),
    linkedin: z.string(),
  }),
  summary: z.string(),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(z.string()),
  projects: z.array(projectSchema),
  certifications: z.array(certificationSchema),
});

export type ResumeDataInput = z.infer<typeof resumeDataSchema>;
