// 0 = Eligible; 1 = Closed; 2 = Banned
export type Eligibility = 0 | 1 | 2;

export type EligibilityStatus = {
  publish: Eligibility;
  verification: Eligibility;
  hosting: Eligibility;
  reporting: Eligibility;
};

export enum Visibility {
  PUBLIC = 0,
  PRIVATE = 1,
}

type StoreItem = {
  type: "plugin" | "theme";
  description: string;
  author: string;
  visibility: Visibility;

  repository: string;
  branch: string;

  stars: number;
  downloads: number;

  lastCommit: string;
  lastCommitTime: Date;

  nsfw: boolean;
};

type PendingForm = {
  reviewed?: false;
  approved?: boolean;
  reviewer?: null;
  reviewReason?: null;
  submitter: string;
};
type ReviewedForm = {
  reviewed: true;
  approved: boolean;
  reviewer: string;
  reviewReason?: string;
  submitter?: string;
};

export type Form = (PendingForm | ReviewedForm) & {
  _id: string;
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
