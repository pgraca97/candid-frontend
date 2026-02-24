import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../api/client"
import type { Application } from "../types"

export function useUpdateApplication() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    // A mutation function recebe o ID da application
    // e os campos a atualizar
    mutationFn: async ({
      id,
      data,
    }: {
      id: number
      data: Partial<Omit<Application, "id" | "createdAt" | "updatedAt">>
    }) => {
      const response = await apiClient.patch(`/applications/${id}`, data)
      return response.data
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["my-applications"] })

      const previousApplications = queryClient.getQueryData(["my-applications"])

      queryClient.setQueryData<Application[]>(["my-applications"], (old) => {
        return (
          old?.map((app) =>
            app.id === id
              ? { ...app, ...data } // Aplica as mudanças
              : app
          ) ?? []
        )
      })

      return { previousApplications }
    },

    onError: (err, _variables, context) => {
      queryClient.setQueryData(["my-applications"], context?.previousApplications)
      console.error("Failed to update application:", err)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] })
    },
  })

  return mutation
}
