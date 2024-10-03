<script setup lang="ts">
import NavigationBar from "./components/NavigationBar.vue";
import UserVerification from "./components/UserVerification.vue";
</script>

<template>
  <div id="body">
    <NavigationBar/>
    <div class="container">
      <UserVerification/>
      <div class="content">aa</div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap');
#app, input {
  font-family: "Noto Sans JP";
}

#body {
  display: flex;
  flex-direction: column;
  height: 100%;
}
@media (max-width: 300px) {
  #body {
    background-color: red
  }
}
:root {
  /* google color: #0b57d0 */
  --formColorValid: #3cdd3c;
  --formColorInvalid: #dd573c;
  --formColorPending: #ddcf3c;
  --formColorError: #db3d3d;
}
.navigation-bar {
  height: 48px;
  box-sizing: border-box;
}
.container {
  background-color: #eee;
  flex-grow: 1;
}
.content {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 2px;
}

.content > * {
  display: block;
}



</style>
