import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { apiClient } from "../api/client"
import { EditableCell } from "../components/EditableCell"
import Table from "../components/Table"
import type { Application } from "../types"

const columnHelper = createColumnHelper<Application>()

const count = (string: string | undefined) => [...(string ?? "").matchAll(/\b\w+\b/g)].length

const columns = [
  columnHelper.display({
    id: "index",
    header: "",
    cell: (info) => info.row.index + 1,
    meta: {
      className: "group relative w-12",
    },
  }),
  columnHelper.accessor("company", {
    header: "Company",
    cell: (info) => {
      console.log(info.cell)
      return (
        <EditableCell
          initialValue={info.getValue().name}
          applicationId={info.row.original.id}
          companyId={info.getValue().id}
          field="company"
        />
      )
    },
    meta: {
      className: "relative",
      isEditable: true,
    },
  }),
  columnHelper.accessor("position", {
    header: "Position",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("notes", {
    header: "Notes",
    cell: (info) => {
      const value = info.getValue()
      const wordCount = count(value)
      return `${wordCount} words`
    },
  }),
  columnHelper.accessor("applicationDate", {
    header: "Application Date",
    cell: (info) => {
      const date = new Date(info.getValue())
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    },
  }),
]

const MyApplicationsPage = () => {
  const getApplications = async (): Promise<Application[]> => {
    const res = await apiClient.get("/applications")
    console.log("Fetched applications:", res.data)
    return await res.data
  }

  // TanStack Query já dá referência estável
  // para a data da tabela
  const { data } = useQuery({
    queryKey: ["my-applications"],
    queryFn: getApplications,
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900">My Applications Page</h1>
      <h2 className="font-semibold">All Applications</h2>
      {data && <Table columns={columns} data={data} />}
      <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
        ← Back to Home
      </Link>
    </div>
  )
}

export default MyApplicationsPage