import { getAllCompanies } from "@/lib/data";
import CompaniesClient from "./CompaniesClient";

export default function CompaniesPage() {
  const companies = getAllCompanies();
  return <CompaniesClient companies={companies} />;
}
