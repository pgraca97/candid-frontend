import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../api/client"
import type { Application } from "../types"

export function useDeleteApplication() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    // Mutation para apagar a application
    // e conseguir invalidar a cache
    mutationFn: async (applicationId: number) => {
      await apiClient.delete(`/applications/${applicationId}`)
    },
    // onMutate executa ANTES da mutation
    onMutate: async (applicationId) => {
      // Cancela qualquer refetch que esteja a acontecer
      // (para não sobrescrever o optimistic update)
      await queryClient.cancelQueries({ queryKey: ["my-applications"] })

      // Guarda o estado atual (snapshot) para caso algo corra mal
      const previousApplications = queryClient.getQueryData(["my-applications"])

      // Atualiza a cache IMEDIATAMENTE
      // removendo a application a ser deletada
      queryClient.setQueryData<Application[]>(["my-applications"], (old) => {
        return old?.filter((app) => app.id !== applicationId) ?? []
      })

      // Retorna o snapshot para utilizar no onError se necessário
      return { previousApplications }
    },
    onError: (err, _applicationId, context) => {
      // Se algo correu mal, voltar atrás
      queryClient.setQueryData(["my-applications"], context?.previousApplications)
      console.error("Failed to delete:", err)
    },
    onSettled: () => {
      // Quer tenha sucesso ou erro
      // revalida para garantir sincronização
      queryClient.invalidateQueries({ queryKey: ["my-applications"] })
    },
  })

  const deleteWithConfirmation = (id: number, onSuccess?: () => void) => {
    const confirmed = window.confirm("Are you sure?") // Melhorar isto depois
    if (confirmed) {
      mutation.mutate(id, { onSuccess })
    }
  }

  return { ...mutation, deleteWithConfirmation }
}
