import { getAllCompanies } from "@/lib/data";
import CompareClient from "./CompareClient";

export default function ComparePage() {
  const companies = getAllCompanies();
  return <CompareClient allCompanies={companies} />;
}
