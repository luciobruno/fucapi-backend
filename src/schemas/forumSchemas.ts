import { z } from 'zod';


export const createForumSchema = z.object({

  name: z.string()
           .min(3, "O nome é obrigatório e deve ter pelo menos 3 caracteres."),
  
  description: z.string()
                  .min(10, "A descrição é obrigatória e deve ter pelo menos 10 caracteres."),
  
  tag: z.string()
           .min(1, "A tag é obrigatória.")
});

export const createTopicSchema = z.object({
  title: z.string()
            .min(5, "O título é obrigatório e deve ter pelo menos 5 caracteres."),
  
  author: z.string()
             .min(3, "O autor é obrigatório e deve ter pelo menos 3 caracteres."),
  
  content: z.string()
              .min(10, "O conteúdo é obrigatório e deve ter pelo menos 10 caracteres.")
});

export const createReplySchema = z.object({
  author: z.string()
             .min(3, "O autor é obrigatório."),
  
  text: z.string()
           .min(5, "O texto é obrigatório e deve ter pelo menos 5 caracteres."),
  
  accepted: z.boolean().optional().default(false)
});

export const updateForumSchema = createForumSchema.partial();
export const updateTopicSchema = createTopicSchema.partial();
export const updateReplySchema = createReplySchema.partial();