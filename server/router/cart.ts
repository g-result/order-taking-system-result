import { router } from '~/lib/trpc/trpc'
import { cartRepository } from '../repository/cart'
import { userProcedure } from '../middleware'

export const cartRouter = router({
  findByUser: userProcedure.query(async ({ ctx: { userId } }) => {
    return await cartRepository.findByUser(userId)
  }),

  delete: userProcedure.mutation(async ({ ctx: { userId } }) => {
    const cart = await cartRepository.findByUser(userId)
    if (cart) await cartRepository.delete(cart.id)
  })
})
