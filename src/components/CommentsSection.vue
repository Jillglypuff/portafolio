<template>
  <section class="comments-section">
    <div class="comments-inner">
      <h3 class="comments-title">
        <span>{{ labels[currentLang].title }}</span>
        <span class="comments-count">{{ comments.length }}</span>
      </h3>

      <!-- Formulario para dejar comentario -->
      <div class="comment-form-card">
        <h4 class="form-heading">
          {{ labels[currentLang].leaveComment }}
        </h4>

        <!-- Mensaje de Éxito -->
        <div v-if="successMessage" class="alert alert-success">
          <div>
            <p class="alert-title">{{ successMessage }}</p>
            <p class="alert-desc">{{ labels[currentLang].moderationNotice }}</p>
          </div>
        </div>

        <!-- Mensaje de Error -->
        <div v-if="errorMessage" class="alert alert-error">
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="submitComment" class="comment-form">
          <div class="form-group">
            <label class="form-label">
              {{ labels[currentLang].nameLabel }} <span class="required-star">*</span>
            </label>
            <input 
              v-model="authorName"
              type="text"
              required
              maxlength="100"
              :placeholder="labels[currentLang].namePlaceholder"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              {{ labels[currentLang].commentLabel }} <span class="required-star">*</span>
            </label>
            <textarea
              v-model="content"
              required
              rows="4"
              maxlength="2000"
              :placeholder="labels[currentLang].commentPlaceholder"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-footer">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="submit-btn"
            >
              <span>{{ isSubmitting ? labels[currentLang].sending : labels[currentLang].submitBtn }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de comentarios aprobados -->
      <div class="comments-list-wrapper">
        <h4 class="list-heading">
          {{ labels[currentLang].commentsHeader }} ({{ comments.length }})
        </h4>

        <div v-if="isLoading" class="loading-state">
          {{ labels[currentLang].loadingComments }}
        </div>

        <div v-else-if="comments.length === 0" class="empty-state">
          <p class="empty-title">{{ labels[currentLang].emptyComments }}</p>
          <p class="empty-sub">{{ labels[currentLang].beFirst }}</p>
        </div>

        <div 
          v-for="comment in comments" 
          :key="comment.id"
          class="comment-card"
        >
          <div class="comment-header">
            <div class="author-info">
              <div class="author-avatar">
                {{ comment.author_name.charAt(0).toUpperCase() }}
              </div>
              <span class="author-name">{{ comment.author_name }}</span>
            </div>
            <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
          </div>

          <p class="comment-content">
            {{ comment.content }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  slug: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    default: 'es'
  }
});

const currentLang = computed(() => {
  return (props.lang === 'en' || props.lang === 'pt') ? props.lang : 'es';
});

const labels: Record<string, Record<string, string>> = {
  es: {
    title: 'Comentarios',
    leaveComment: 'Déjame un comentario',
    nameLabel: 'Tu nombre',
    namePlaceholder: 'Ej. María Pérez',
    commentLabel: 'Comentario',
    commentPlaceholder: 'Comparte tu opinión, dudas o sugerencias...',
    submitBtn: 'Enviar comentario',
    sending: 'Enviando...',
    moderationNotice: 'Tu comentario ha sido enviado y aparecerá tan pronto como sea revisado.',
    commentsHeader: 'Comentarios publicados',
    loadingComments: 'Cargando comentarios...',
    emptyComments: 'Aún no hay comentarios publicados en este artículo.',
    beFirst: '¡Sé la primera persona en opinar!'
  },
  en: {
    title: 'Comments',
    leaveComment: 'Leave a comment',
    nameLabel: 'Your name',
    namePlaceholder: 'E.g. Maria Perez',
    commentLabel: 'Comment',
    commentPlaceholder: 'Share your thoughts, questions, or feedback...',
    submitBtn: 'Submit comment',
    sending: 'Submitting...',
    moderationNotice: 'Your comment has been submitted and will appear once approved.',
    commentsHeader: 'Published comments',
    loadingComments: 'Loading comments...',
    emptyComments: 'No published comments yet on this post.',
    beFirst: 'Be the first one to share your thoughts!'
  },
  pt: {
    title: 'Comentários',
    leaveComment: 'Deixe um comentário',
    nameLabel: 'Seu nome',
    namePlaceholder: 'Ex. Maria Perez',
    commentLabel: 'Comentário',
    commentPlaceholder: 'Compartilhe suas ideias, dúvidas ou sugestões...',
    submitBtn: 'Enviar comentário',
    sending: 'Enviando...',
    moderationNotice: 'Seu comentário foi enviado e aparecerá assim que for aprovado.',
    commentsHeader: 'Comentários publicados',
    loadingComments: 'Carregando comentários...',
    emptyComments: 'Ainda não há comentários publicados neste artigo.',
    beFirst: 'Seja o primeiro a comentar!'
  }
};

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const comments = ref<Comment[]>([]);
const authorName = ref('');
const content = ref('');
const isSubmitting = ref(false);
const isLoading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

const fetchComments = async () => {
  isLoading.value = true;
  try {
    const res = await fetch(`/api/comments?slug=${encodeURIComponent(props.slug)}`);
    if (res.ok) {
      const data = await res.json();
      comments.value = data.comments || [];
    }
  } catch (err) {
    console.error('Error loading comments:', err);
  } finally {
    isLoading.value = false;
  }
};

const submitComment = async () => {
  if (!authorName.value.trim() || !content.value.trim()) return;

  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: props.slug,
        author_name: authorName.value.trim(),
        content: content.value.trim()
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      successMessage.value = data.message;
      content.value = '';
    } else {
      errorMessage.value = data.error || 'Ocurrió un error al enviar el comentario.';
    }
  } catch (err) {
    errorMessage.value = 'No se pudo conectar con el servidor. Intenta de nuevo.';
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(currentLang.value === 'es' ? 'es-ES' : currentLang.value === 'pt' ? 'pt-BR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

onMounted(() => {
  fetchComments();
});
</script>

<style scoped>
.comments-section {
  margin-top: 3.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid var(--border, rgba(255, 75, 145, 0.2));
  width: 100%;
}

.comments-inner {
  max-width: 800px;
  margin: 0 auto;
}

.comments-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text, #fce4ec);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.comments-count {
  font-size: 0.8rem;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  background: rgba(255, 75, 145, 0.15);
  color: var(--rose-light, #ff9ebb);
  border: 1px solid var(--border, rgba(255, 75, 145, 0.3));
}

.comment-form-card {
  background: var(--bg-tint, #160e1f);
  border: 1px solid var(--border, rgba(255, 75, 145, 0.2));
  border-radius: var(--radius-md, 16px);
  padding: 1.75rem;
  box-shadow: var(--shadow-sm, 0 4px 20px rgba(0,0,0,0.3));
  margin-bottom: 2.5rem;
}

.form-heading {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text, #fce4ec);
  margin-bottom: 1.25rem;
}

.alert {
  padding: 1rem;
  border-radius: var(--radius-sm, 8px);
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.alert-success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.alert-error {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fda4af;
}

.alert-title {
  font-weight: 600;
}

.alert-desc {
  font-size: 0.8rem;
  opacity: 0.85;
  margin-top: 0.25rem;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted, #c2a7bf);
}

.required-star {
  color: var(--rose, #ff4b91);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm, 8px);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border, rgba(255, 75, 145, 0.25));
  color: var(--text, #fce4ec);
  font-family: inherit;
  font-size: 0.9rem;
  transition: var(--transition, all 0.3s ease);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--rose, #ff4b91);
  box-shadow: 0 0 0 3px rgba(255, 75, 145, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

.submit-btn {
  padding: 0.65rem 1.4rem;
  border-radius: var(--radius-sm, 8px);
  background: linear-gradient(135deg, var(--rose, #ff4b91), var(--rose-dark, #d4145a));
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 75, 145, 0.3);
  transition: var(--transition, all 0.3s ease);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 75, 145, 0.45);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comments-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-heading {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--rose-light, #ff9ebb);
  margin-bottom: 0.5rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--border, rgba(255, 75, 145, 0.2));
  border-radius: var(--radius-md, 16px);
  color: var(--text-muted, #c2a7bf);
  font-size: 0.9rem;
}

.empty-sub {
  font-size: 0.8rem;
  opacity: 0.6;
  margin-top: 0.3rem;
}

.comment-card {
  background: var(--card, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border, rgba(255, 75, 145, 0.15));
  border-radius: var(--radius-md, 16px);
  padding: 1.25rem 1.5rem;
  transition: var(--transition, all 0.3s ease);
}

.comment-card:hover {
  border-color: var(--border, rgba(255, 75, 145, 0.35));
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rose, #ff4b91), var(--lavender, #b388ff));
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.author-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text, #fce4ec);
}

.comment-date {
  font-size: 0.78rem;
  color: var(--text-muted, #c2a7bf);
  opacity: 0.7;
}

.comment-content {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--text, #fce4ec);
  padding-left: 2.65rem;
  white-space: pre-line;
}
</style>
