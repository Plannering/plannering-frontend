import { redirect } from "next/navigation";

export default function Adminpage() {
  redirect("/admin/dashboard");
  return null;
}
