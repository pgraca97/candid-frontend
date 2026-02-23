import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import { apiClient } from "../api/client"
import { useDeleteApplication } from "../hooks/useDelApplication"
import type { Application } from "../types"

const ApplicationPage = () => {
  const { id } = useParams({ from: "/application/$id" })
  const { deleteWithConfirmation, isPending } = useDeleteApplication()
  const navigate = useNavigate()

  const getApplication = async (): Promise<Application> => {
    const res = await apiClient.get(`/applications/${id}`)
    return await res.data
  }

  const { data } = useQuery({
    queryKey: ["application", id],
    queryFn: getApplication,
  })

  return (
    <>
      <h1>Application Page</h1>
      <pre>{JSON.stringify(data, null, 20)}</pre>
      <button
        type="button"
        onClick={() =>
          data && deleteWithConfirmation(data.id, () => navigate({ to: "/my-applications" }))
        }
        disabled={isPending || !data}
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
    </>
  )
}

export default ApplicationPage
