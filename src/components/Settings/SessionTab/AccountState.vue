<template>
  <div>
    <h3 :class="$style.header">アカウント</h3>
    <div :class="$style.content">
      <form-button
        label="ログアウト"
        :class="$style.logout"
        @click="onLogoutClick"
      />
      <form-button label="全セッション破棄" @click="onSessionDelete" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormButton from '/@/components/UI/FormButton.vue'
import { useRouter } from 'vue-router'
import { useMeStore } from '/@/store/domain/me'

const router = useRouter()
const { logout } = useMeStore()

const onLogoutClick = async () => {
  await logout()
  router.push('/login')
}

const onSessionDelete = async () => {
  // TODO: セッション表示と特定のセッション破棄とかする？
  if (
    window.confirm(
      'ログイン中のセッションを全て破棄します。（実行するとログアウトされます）'
    )
  ) {
    await logout({ allSession: true })
    router.push('/login')
  }
}
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.content {
  margin-left: 12px;
}
.logout {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
