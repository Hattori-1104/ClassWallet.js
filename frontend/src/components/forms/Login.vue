<script setup lang="ts">
import FormInput from './Input.vue';
import { ref } from "vue"
import { z } from "zod"
import { EmitFormInput } from '../../modules/types/form';

const userId_schema = { parse: (value: string) => {
  if (value[0] == "@") return z.string()
    .regex(/^[\u0021-\u007e]*$/u, { message: "半角英数記号を使用してください" })
    .startsWith("@", { message: "「@」から始まるユーザータグ" })
    .min(2, { message: "2文字以上入力してください" })
    .max(100, { message: "100文字以内で入力してください"})
    .parse(value)
  else return z.string()
    .regex(/^[\u0021-\u007e]*$/u, { message: "半角英数記号を使用してください" })
    .email({ message: "無効なメールアドレスまたはユーザータグ" })
    .max(200, { message: "200文字以内で入力してください" })
    .parse(value)
} }

const password_schema = z.string()
  .regex(/^[\u0021-\u007e]*$/u, { message: "半角英数記号を使用してください" })
  .min(4, { message: "4文字以上入力してください" })
  .max(50, { message: "50文字以内で入力してください" })

const isUserIdValid = ref<boolean>(false)
const userIdValue = ref<string>("")
const onUpdateUserId = (e: EmitFormInput) => {
  isUserIdValid.value = e.valid
  if (e.valid) userIdValue.value = e.value
}

const isPasswordValid = ref<boolean>(false)
const passwordValue = ref<string>("")
const onUpdatePassword = (e: EmitFormInput) => {
  isPasswordValid.value = e.valid
  if (e.valid) passwordValue.value = e.value
}

const onSubmit = () => {
  if (!(isPasswordValid.value && isUserIdValid.value)) {
    alert("ログインできません。")
    return
  }
  else console.log("ログインしました")
}
</script>

<template>
  <form action="" name="login" onsubmit="return false" @submit="onSubmit">
    <FormInput name="userId" :schema="userId_schema" label="メールアドレスまたはユーザータグ" @update="onUpdateUserId"/>
    <FormInput name="password" :schema="password_schema" label="パスワード" @update="onUpdatePassword"/>
    <input type="submit" value="login">
  </form>
</template>

<style lang="scss">

</style>