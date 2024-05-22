<script lang="ts" setup>
import { Ref, ref, watch } from 'vue';
import remarkMath from 'remark-math';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeFormat from 'rehype-format';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';

const leftTextarea: Ref<HTMLTextAreaElement | null> = ref(null);
const rightDiv: Ref<HTMLDivElement | null> = ref(null);

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
const finalPastedData = ref('');

watch(content, async () => {
  let processedContent;
  if (finalPastedData.value) {
    // 获取并处理内容
    processedContent = finalPastedData.value;

    // 使用正则表达式找到所有 class 为 math-display 的 div 标签
    processedContent = processedContent.replace(
      /<div class="math math-display">(.*?)<\/div>/gs,
      (match, p1) => {
        // 检查内容是否以小括号或中括号开头
        if (!/^[\[\(]/.test(p1.trim())) {
          // 如果不是，则用中括号包起来
          return `<div class="math math-display">[ ${p1.trim()} ]</div>`;
        }
        return match;
      },
    );
  }

  const html2Markdown = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(processedContent || content.value);

  const removeBackslashesBeforeCharacters = (s: string) => {
    return s.replace(/\\(_|\[)/g, '$1');
  };

  let html2MarkdownText = parsingTransformationContent(
    removeBackslashesBeforeCharacters(String(html2Markdown)),
  );

  function optimizeCodeSection(html2MarkdownText: string) {
    // 使用正则表达式匹配 ``` 后面跟随空格或回车符号，并确保这些符号后面有字母字符
    const regex = /```[\s\r\n]+(?=[a-zA-Z])/g;
    // 使用 replace 方法去掉匹配到的空格和回车符号
    return html2MarkdownText.replace(regex, '```');
  }

  // optimize the Markdown code section
  html2MarkdownText = optimizeCodeSection(html2MarkdownText);

  // 在 console 输出转换后的 Markdown 文本，方便复制 markdown 文本
  console.log(html2MarkdownText);

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        // The `language-*` regex is allowed by default.
        code: [['className', /^language-./, 'math-inline', 'math-display']],
      },
    })
    .use(rehypeKatex)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(html2MarkdownText);

  result.value = String(file);
  finalPastedData.value = '';
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
    /(\s)([\(\)\[\]])([\u3000-\u303F\uFF00-\uFFEF*])/g,
    '$1$$$3',
  );

  // 匹配规则4: 左括号的左边有空格或中文标点，右括号的右边有空格或中文标点，左括号的右边没有空格且紧跟任何字符，右括号的左边没有空格
  content = content.replace(
    /([\s\u3000-\u303F\uFF00-\uFFEF])\((.*?)\)([\s\u3000-\u303F\uFF00-\uFFEF])/g,
    '$1$$$2$$$3',
  );

  content = content.replace(/(.?)\$([^$]+?)\$(.?)/g, (_, p1, p2, p3) => {
    // p1作为left 如果p1不是空格或换行符，那么在p1的右边加上一个空格
    if (!/\s/.test(p1)) {
      p1 += ' ';
    }
    // p3作为right 如果p3不是空格或换行符，那么在p3的左边加上一个空格
    if (p3 && !/\s/.test(p3)) {
      p3 = ' ' + p3;
    }
    p2 = p2.trim();
    return `${p1}$${p2}$${p3}`;
  });
  content = content.replace(/\$ \*/g, '$*');

  return content;
}

const handlePaste = (e: ClipboardEvent) => {
  // 获取粘贴的数据
  const clipboardData = e.clipboardData;
  const pastedData = clipboardData?.getData('text/html');
  const tempDiv = document.createElement('div');
  if (!pastedData) return;
  tempDiv.innerHTML = pastedData;
  const allElements = tempDiv.getElementsByTagName('*');
  for (const element of allElements) {
    // 不删除 class 因为包含特殊 class 需要进行判定 element.removeAttribute('class');
    element.removeAttribute('style');
  }
  finalPastedData.value = tempDiv.innerHTML;
};

function syncScroll(side: 'left' | 'right') {
  const left = leftTextarea.value;
  const right = rightDiv.value;
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
  <div class="w-full h-2/3 responsive-h">
    <div class="grid grid-cols-11 h-full responsive-grid">
      <div />
      <textarea
        ref="leftTextarea"
        :class="textareaStyle"
        placeholder="Enter any text..."
        v-model="content"
        @scroll="syncScroll('right')"
        @paste="handlePaste"
      ></textarea>
      <div />
      <div
        ref="rightDiv"
        class="right-content overflow-auto"
        v-html="result"
        :class="textareaStyle"
        @scroll="syncScroll('left')"
      ></div>
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

[aria-hidden='true'] {
  display: none;
}

.right-content {
  user-select: none;
  cursor: default;
  outline: none;
  background-color: field;
  text-align: left;
}

.right-content > p:first-child {
  margin-top: 0;
}
</style>
