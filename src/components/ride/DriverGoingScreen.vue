<script setup lang="ts">
import { onMounted, ref } from "vue";
import { CupertinoPane } from "cupertino-pane";
import {
  Banknote,
  Navigation,
  Car,
  UserRound,
  Star,
  Timer,
  Phone,
  Ban,
  MessageCircleWarning,
} from "lucide-vue-next";
import { Button as MainButton } from "@/components/ui/button";

const pane = ref();

onMounted(async () => {
  pane.value = new CupertinoPane(".sheet-pane", {
    breaks: {
      top: { enabled: true, height: 420 },
      middle: { enabled: true, height: 340 },
      bottom: { enabled: true, height: 40 },
    },
    initialBreak: "middle",
    draggableOver: true,
    parentElement: ".app",
    cssClass: "z-50",
    buttonDestroy: false,
  });

  await pane.value.present({ animate: true });
});
</script>

<template>
  <div
    class="main-content sheet-pane bg-primary-foreground text-center text-foreground px-6 pt-2"
  >
    <div class="top flex items-center justify-between border-b pb-4">
      <div class="left flex flex-col items-start">
        <p class="font-manrope text-gray-300">Haydovchi manzili</p>
        <div class="flex items-center mt-2">
          <Navigation class="w-5 h-5 mr-2" />
          <h2 class="text-primary font-poppins text-lg font-bold">
            Bobur ko'ch.
          </h2>
        </div>
      </div>
      <div
        class="right space-x-2 flex items-center font-poppins font-semibold text-lg"
      >
        <Banknote />
        <p>17,000 so'm</p>
      </div>
    </div>
    <div class="middle">
      <div class="car flex items-center space-x-2 mt-4">
        <Car />
        <p class="font-poppins font-semibold">Nexia 3</p>
        <div
          class="plate w-auto px-1 font-semibold border border-black rounded font-sans"
        >
          90 A 989 RA
        </div>
        <MainButton class="font-manrope justify-self-end"><MessageCircleWarning class="h-5 w-5 mr-2"/> Shikoyat qilish</MainButton>
      </div>
      <div class="driver flex space-x-4 mt-5">
        <div
          class="avatar inline-flex items-center justify-center font-normal text-foreground select-none shrink-0 bg-secondary overflow-hidden h-12 w-12 text-2xl rounded-full"
        >
          <UserRound />
        </div>
        <div class="names">
          <h3 class="fullname font-poppins font-bold text-lg flex items-center">
            Sharof Rashidov
            <p class="star flex items-center text-sm ml-3 opacity-30">
              <Star class="w-4 h-4 mr-2" /> 4,5
            </p>
          </h3>
          <p class="phone flex items-center font-manrope text-sm font-semibold">
            +998999447613
          </p>
        </div>
      </div>
      <div class="time flex items-center font-manrope mt-6 font-semibold">
        <Timer class="mr-2 w-5 h-5" /> 3 daqiqada boradi
      </div>
    </div>
    <div class="buttons space-y-4 mt-4">
      <MainButton variant="outline" class="w-full py-6 text-lg font-manrope"
        ><Phone class="w-5 h-5 mr-2" /> Qo'ng'iroq qilish</MainButton
      >
      <MainButton class="w-full py-6 text-lg font-manrope"
        ><Ban class="w-5 h-5 mr-2" /> Bekor qilish</MainButton
      >
    </div>
  </div>
</template>

<style scoped>
.custom-style {
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 8px -2px rgba(0, 0, 0, 0.2);
}
</style>
