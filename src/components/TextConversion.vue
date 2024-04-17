<script lang="ts" setup>
import { Ref, ref, watch } from 'vue';

const leftTextarea: Ref<HTMLTextAreaElement | null> = ref(null);
const rightTextarea: Ref<HTMLTextAreaElement | null> = ref(null);

const textareaStyle = ref([
  'w-full',
  'h-full',
  'p-2',
  'resize-none',
  'col-span-4',
  'responsive-grid-item',
  'rounded-lg',
]);

const content = ref('');
const result = ref('');

watch(content, () => {
  result.value = parsingTransformationContent(content.value);
});

function parsingTransformationContent(content: string | null) {
  /*
   * 功能描述：
   * 如果出现一个英文的小括号或者中括号，且不管左边还是右边的部分只要前后均有个空格，将其转换为$符号
   * 如果英文的小括号或中括号的左半边的左边没有空格但是仅靠着中文标点符号包括括号，那么将英文括号也
   * 转换为$符号，另一边同理
   */
  if (!content) return '';

  // 匹配规则1: 前后有空格的小括号或中括号
  content = content.replace(/(\s)([\(\)\[\]])(\s)/g, '$1$$$3');

  // 匹配规则2: 左边紧邻中文标点但右边有空格的小括号或中括号
  content = content.replace(
    /([\u3000-\u303F\uFF00-\uFFEF])([\(\)\[\]])(\s)/g,
    '$1$$$3',
  );

  // 匹配规则3: 右边紧邻中文标点但左边有空格的小括号或中括号
  content = content.replace(
    /(\s)([\(\)\[\]])([\u3000-\u303F\uFF00-\uFFEF])/g,
    '$1$$$3',
  );

  return content;
}

function syncScroll(side: 'left' | 'right') {
  const left = leftTextarea.value;
  const right = rightTextarea.value;
  if (side === 'left' && left && right) {
    left.scrollTop = right.scrollTop;
    left.scrollLeft = right.scrollLeft;
  } else if (side === 'right' && left && right) {
    right.scrollTop = left.scrollTop;
    right.scrollLeft = left.scrollLeft;
  }
}
</script>

<template>
  <div class="w-full h-1/2 responsive-h">
    <div class="grid grid-cols-11 h-full responsive-grid">
      <div />
      <textarea
        ref="leftTextarea"
        :class="textareaStyle"
        placeholder="Enter any text..."
        v-model="content"
        @scroll="syncScroll('right')"
      ></textarea>
      <div />
      <textarea
        ref="rightTextarea"
        v-model="result"
        :class="textareaStyle"
        readonly
        @scroll="syncScroll('left')"
      ></textarea>
      <div />
    </div>
  </div>
</template>

<style>
@media (max-width: 800px) {
  .responsive-h {
    height: 100%;
  }

  .responsive-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 3fr 1fr 3fr 1fr;
  }
}

textarea[readonly] {
  user-select: none;
  cursor: default;
  outline: none;
}
</style>
