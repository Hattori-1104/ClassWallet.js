<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { z } from "zod"
import { FormMode, EmitFormInput } from '../../modules/types/form';

// schemaはz.ZodSchemaではない
// parseメソッドを持つオブジェクト
const { schema } = defineProps<{
  name: string
  type?: string
  label?: string
  schema?: any
}>()

// イベント
// 値を親に渡す
const emit = defineEmits<{
  update: [EmitFormInput]
}>()

// 値
const value = ref<string>("")

// 状態
const mode = ref<FormMode>("blank")

// ヒント
type HintSet = {code: string, message: string}
const hint_set = reactive<{value: {[key in FormMode]?: HintSet[]}}>({value: {}})

// 値を監視
watch(value, () => {
  // フォームが空の場合
  if (!value.value) {
    mode.value = "blank"
    hint_set.value = {}
    emit("update", { valid: false })
    return
  }
  // スキーマが定義されてない場合
  if (!schema) {
    mode.value = "valid"
    hint_set.value = {}
    emit("update", { valid: false })
    return
  }
  // スキーマをパース
  try {
    schema.parse(value.value)
    // 成功
    mode.value = "valid"
    hint_set.value = {}
    emit("update", { valid: true, value: value.value })
  } catch (err: any) {
    // ZodErrorではない場合はそのまま再びスロー
    if (!(err instanceof z.ZodError)) throw err
    // 失敗
    mode.value = "invalid"
    hint_set.value.invalid = JSON.parse(err.message)
    emit("update", { valid: false })
  }
})

</script>

<template>
  <div>
    <div id="wrapper">
      <input
        id="input"
        :type="type ?? 'text'"
        :name="name"
        placeholder=" "
        autocomplete="off"
        v-model="value"
      />
      <div id="body" :mode="mode"></div>
      <label id="label" for="input">{{ label ?? name }}</label>
    </div>
    <ul id="hint">
      <div class="invalid" v-for="invalid_errors in hint_set.value.invalid" :key="invalid_errors.code">
        <li>{{ invalid_errors.message }}</li>
      </div>
    </ul>
  </div>
</template>
<style scoped lang="scss">
#wrapper {
  position: relative;
  width: 100%;
  height: 60px;
}
#input {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  bottom: 0;
  outline: none;
  border: none;
  background: none;
  font-size: 16px;
  padding: 0 12px;
  z-index: 2;
}
#body {
  position: absolute;
  width: 100%;
  box-sizing: border-box;
  height: 48px;
  bottom: 0;
  border: 1px #888 solid;
  border-radius: 8px;
  transition-duration: 100ms;
  z-index: 0;
}
#label {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background-color: white;
  padding: 0 4px;
  color: #444;
  font-size: 14px;
  height: 24px;
  line-height: 24px;
  transition-duration: 100ms;
  border-radius: 4px;
  z-index: 1;
}
#body {
  [mode="valid"] {
    border: 1px var(--formColorValid) solid;
  }
  [mode="invalid"] {
    border: 1px var(--formColorInvalid) solid;
  }
  [mode="pending"] {
    border: 1px var(--formColorPending) solid;
  }
  [mode="error"] {
    border: 1px var(--formColorError) solid;
  }
}
#input:focus ~ #label,
#input:not(:placeholder-shown) ~ #label {
  bottom: 36px;
  font-size: 12px;
}

#hint {
  list-style: none;
  font-size: 14px;
  li {
    height: 20px;
    display: inline-block;
    padding-left: 4px;
  }
  .invalid {
    color: var(--formColorInvalid);
    ::before {
      display: inline-block;
      content: url("../assets/error_icon.svg");
      padding-right: 4px;
      vertical-align: middle;
    }
  }
}
</style>
