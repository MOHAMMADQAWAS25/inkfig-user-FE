import { requestJson, userApiBaseUrl } from "../../api/httpClient";

export type ReportReason="harassment"|"hate_speech"|"sexual_content"|"violence"|"spam"|"copyright"|"impersonation"|"other";
export type ReportStatus="pending"|"reviewed"|"dismissed"|"actioned";
export type ReportItem={report_id:string;reporter_user_id:string;reporter_name:string;target_type:"work"|"user";target_user_id:string;target_user_name:string;target_work_id:string|null;target_work_title:string|null;reason_code:ReportReason;details:string|null;status:ReportStatus;reviewer_notes:string|null;created_at:string;reviewed_at:string|null};
export type ReportPage={items:ReportItem[];next_cursor:number|null};

export async function createReport(input:{targetType:"work"|"user";targetUserId:string;targetWorkId?:string;reasonCode:ReportReason;details?:string}){await requestJson<null>(userApiBaseUrl,"POST","/reports",{body:{target_type:input.targetType,target_user_id:input.targetUserId,target_work_id:input.targetWorkId??null,reason_code:input.reasonCode,details:input.details?.trim()||null}});}
export async function getReports(status?:ReportStatus,cursor?:number){const query=new URLSearchParams({limit:"25"});if(status)query.set("status",status);if(cursor!==undefined)query.set("cursor",String(cursor));return (await requestJson<ReportPage>(userApiBaseUrl,"GET",`/reports?${query.toString()}`)).data;}
export async function reviewReport(id:string,status:Exclude<ReportStatus,"pending">,notes?:string){await requestJson<null>(userApiBaseUrl,"PATCH",`/reports/${id}`,{body:{status,notes:notes?.trim()||null}});}
