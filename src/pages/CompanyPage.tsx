import { Link, useCanGoBack, useParams, useRouter } from "@tanstack/react-router"
import { apiClient } from "../api/client"
import type { Company } from "../types"
import { useQuery } from "@tanstack/react-query"

const CompanyPage = () => {
  const { id } = useParams({ from: "/company/$id" })

  const router = useRouter();
  const canGoBack = useCanGoBack();

  console.log(router.history)
  console.log(window.history)
  console.log(canGoBack)

  const getCompany = async (): Promise<Company> => {
    const res = await apiClient.get(`/companies/${id}`)
    return await res.data
  }

  const { data } = useQuery({
    queryKey: ["company", id],
    queryFn: getCompany
  })

  const buttons = [
    {
      name: "Home",
      to: "/"
    },
    {
      name: "My Applications",
      to: "/my-applications"
    }
  ]

  return (
    <>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* {canGoBack ?
        (<button onClick={() => router.history.back()}>Go back</button>)
        : null} */}
      <div className="flex gap-x-3">
        {
          buttons.map(b =>
            <Link to={b.to}>{b.name}</Link>
          )
        }
      </div>
    </>
  )
}

export default CompanyPage