import { redirect } from "next/navigation";

export default function Home() {
  console.log("hi");
  redirect("/dashboard");
}
