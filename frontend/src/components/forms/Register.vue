<script setup lang="ts">
import FormInput from './Input.vue';
import { ref } from "vue"
import { z } from "zod"
import { EmitFormInput } from '../../modules/types/form';
import Api from '../../api/methods';
import { createHmac, createHash } from "crypto";

// スキーマ
const email_schema = z.string()
  .regex(/^[\u0021-\u007e]*$/u, { message: "半角英数記号を使用してください" })
  .email({ message: "無効なメールアドレス" })
  .max(200, { message: "200文字以内で入力してください" })

const tag_schema = z.string()
  .regex(/^[\u0021-\u007e]*$/u, { message: "半角英数記号を使用してください" })
  .startsWith("@", { message: "「@」から始まるユーザータグ" })
  .min(2, { message: "2文字以上入力してください" })
  .max(100, { message: "100文字以内で入力してください"})

const name_schema = z.string()
  .min(1, { message: "2文字以上入力してください" })
  .max(100, { message: "100文字以内で入力して下さい" })

const password_schema = z.string()
  .regex(/^[\u0021-\u007e]*$/u, { message: "半角英数記号を使用してください" })
  .min(4, { message: "4文字以上入力してください" })
  .max(50, { message: "50文字以内で入力してください" })

// ハンドラ
const isEmailValid = ref<boolean>(false)
const emailValue = ref<string>("")
const onUpdateEmail = (e: EmitFormInput) => {
  isEmailValid.value = e.valid
  if (e.valid) emailValue.value = e.value
}

const isTagValid = ref<boolean>(false)
const tagValue = ref<string>("")
const onUpdateTag = (e: EmitFormInput) => {
  isTagValid.value = e.valid
  if (e.valid) tagValue.value = e.value
}

const isNameValid = ref<boolean>(false)
const nameValue = ref<string>("")
const onUpdateName = (e: EmitFormInput) => {
  isNameValid.value = e.valid
  if (e.valid) nameValue.value = e.value
}

const isPasswordValid = ref<boolean>(false)
const passwordValue = ref<string>("")
const onUpdatePassword = (e: EmitFormInput) => {
  isPasswordValid.value = e.valid
  if (e.valid) passwordValue.value = e.value
}

const token_ = ref<string>("")

const onSubmit = async () => {
  if (!(isEmailValid.value && isTagValid.value && isNameValid.value && isPasswordValid.value)) {
    console.log("ログインできません")
    return
  }
  const password_hash = createHash("sha256").update(passwordValue.value).digest("hex")
  let res = await Api.registerUser({
    email: emailValue.value,
    tag: tagValue.value,
    name: nameValue.value,
    password_hash: password_hash
  })
  if (res.data.type === "error") {
    console.log("データベースエラー")
    return
  }
  const id = res.data.payload.id
  const token = createHmac("sha256", `${id}`).update(password_hash).digest("hex")
  token_.value = token
}
</script>

<template>
  <form action="" name="login" onsubmit="return false" @submit="onSubmit">
    <FormInput name="email" :schema="email_schema" label="メールアドレス" @update="onUpdateEmail" />
    <FormInput name="tag" :schema="tag_schema" label="ユーザータグ" @update="onUpdateTag" />
    <FormInput name="name" :schema="name_schema" label="ユーザーネーム" @update="onUpdateName" />
    <FormInput name="password" :schema="password_schema" label="パスワード" @update="onUpdatePassword"/>
    <input type="submit" value="register">
  </form>
  <span>{{ token_ }}</span>
</template>

<style lang="scss">

</style>