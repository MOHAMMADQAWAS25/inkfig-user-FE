import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type ReportReason="harassment"|"hate_speech"|"sexual_content"|"violence"|"spam"|"copyright"|"impersonation"|"other";
export type ReportStatus="pending"|"reviewed"|"dismissed"|"actioned";
export type ReportItem={report_id:string;reporter_user_id:string;reporter_name:string;reporter_reporting_blocked?:boolean;reporter_can_be_restricted?:boolean;target_type:"work"|"user";target_user_id:string;target_user_name:string;target_work_id:string|null;target_work_title:string|null;reason_code:ReportReason;details:string|null;status:ReportStatus;reviewer_notes:string|null;created_at:string;reviewed_at:string|null};
export type ReportPage={items:ReportItem[];next_cursor:number|null};
export type PendingReportCount={pending_count:number};

export async function getPendingReportCount(signal?:AbortSignal){return (await requestJson<PendingReportCount>(userApiBaseUrl,"GET","/reports/pending-count",{signal})).data;}

export async function createReport(input:{targetType:"work"|"user";targetUserId:string;targetWorkId?:string;reasonCode:ReportReason;details?:string}){await requestJson<null>(userApiBaseUrl,"POST","/reports",{body:{target_type:input.targetType,target_user_id:input.targetUserId,target_work_id:input.targetWorkId??null,reason_code:input.reasonCode,details:input.details?.trim()||null}});}
export async function getReportingEligibility(signal?:AbortSignal){return (await requestJson<{allowed:boolean}>(userApiBaseUrl,"GET","/reports/eligibility",{signal})).data;}
export async function setReporterRestriction(id:string,blocked:boolean){await requestJson<null>(userApiBaseUrl,"PUT",`/reports/reporters/${id}/restriction`,{body:{blocked}});window.dispatchEvent(new Event("inkfig:reports-changed"));}
export async function getReports(status?:ReportStatus,cursor?:number){const query=new URLSearchParams({limit:"25"});if(status)query.set("status",status);if(cursor!==undefined)query.set("cursor",String(cursor));return (await requestJson<ReportPage>(userApiBaseUrl,"GET",`/reports?${query.toString()}`)).data;}
export async function reviewReport(id:string,status:Exclude<ReportStatus,"pending">,notes?:string){await requestJson<null>(userApiBaseUrl,"PATCH",`/reports/${id}`,{body:{status,notes:notes?.trim()||null}});window.dispatchEvent(new Event("inkfig:reports-changed"));}
