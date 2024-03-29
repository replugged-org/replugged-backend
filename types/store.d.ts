import { ObjectId } from "mongodb";
// 0 = Eligible; 1 = Closed; 2 = Banned
export type Eligibility = 0 | 1 | 2;

export interface EligibilityStatus {
  publish: Eligibility;
  verification: Eligibility;
  hosting: Eligibility;
  reporting: Eligibility;
}

export enum Visibility {
  PUBLIC = 0,
  PRIVATE = 1,
}
interface Author {
  name: string;
  discordID?: string;
  github?: string;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  author: Author | Author[];
  version: string;
  updater?: {
    type: "store" | "github";
    id: string;
  };
  license: string;
  type: "replugged-plugin" | "replugged-theme";
  source?: string;
  image?: string | string[];
}

export interface PaginatedStore {
  page: number;
  numPages: number;
  results: StoreItem[];
}

interface PendingForm {
  reviewed?: false;
  approved?: boolean;
  reviewer?: null;
  reviewReason?: null;
  submitter: string;
}
interface ReviewedForm {
  reviewed: true;
  approved: boolean;
  reviewer: string;
  reviewReason?: string;
  submitter?: string;
}

export type Form = (PendingForm | ReviewedForm) & {
  _id: ObjectId;
  kind: "publish" | "verification" | "hosting";
  messageId: string;
};

export type FormPublish = Form & {
  kind: "publish";
  repoUrl: string;
  bdAlterative: string;
  reviewNotes: string;
  type: string;
  description: string;
};

export type FormVerification = Form & {
  kind: "verification";
  workUrl: string;
  workAbout: string;
  developerAbout: string;
  workFuture: string;
  why: string;
};

export type FormHosting = Form & {
  kind: "hosting";
  repoUrl: string;
  purpose: string;
  technical: string;
  subdomain: string;
  reviewNotes: string;
};

export type StoreForm = FormPublish | FormVerification | FormHosting;

export interface StoreStats {
  id: string;
  date: Date;
  type?: "install" | "update";
  version: string;
  ipHash: string;
}
