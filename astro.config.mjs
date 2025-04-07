import fs from 'fs';
import dayjs from 'dayjs';
import tailwind from '@astrojs/tailwind';

import { defineConfig } from 'astro/config';
import { parse } from 'node-html-parser';
import { SITE } from './src/config';
import rehypeCustomizeImageSrc from './rehype-customize-image-src.js';

const DEFAULT_FORMAT = 'YYYY/MM/DD';
const keyboard_REPO_NAME = 'dxzyw/keyboard';
const START_DATE = '2025-04-07';

function formatDate(date) {
	return dayjs(date).format(DEFAULT_FORMAT);
}

function getFileCreateDate(filePath) {
	return formatDate(fs.statSync(filePath).birthtime);
}

function getkeyboardDate(num) {
	return num < 100
		? formatDate(dayjs(START_DATE).subtract(100 - num, 'week'))
		: getFileCreateDate(filePath);
}

function getTwitterImage(num) {
	return num >= 110 ? `https://keyboard.herotops.xyz/assets/${num}.jpg` : undefined;
}

function defaultLayoutPlugin() {
	return function (tree, file) {
		const filePath = file.history[0];
		const { frontmatter } = file.data.astro;
		frontmatter.layout = '@layouts/post.astro';

		if (tree.children[0]?.value && !frontmatter.pic) {
			const imageElement = parse(tree.children[0].value).querySelector('img');
			frontmatter.pic = imageElement.getAttribute('src');
		}

		if (tree.children[1]?.children[1]?.value) {
			frontmatter.desc = tree.children[1].children[1].value;
		}

		frontmatter.desc = frontmatter.desc || SITE.description;
		frontmatter.pic = frontmatter.pic || SITE.pic;

        if (!frontmatter.date) {
            let postNumber = '0';
            if (filePath && filePath.includes('/posts/')) {
                const parts = filePath.split('/posts/')[1].split('-');
                postNumber = parts.length > 0 ? parts[0] : '0';
            }
            frontmatter.date = SITE.repo === keyboard_REPO_NAME
                ? getkeyboardDate(postNumber)
                : getFileCreateDate(filePath);
        }

        if (SITE.repo === keyboard_REPO_NAME) {
            let postNumber = '0';
            if (filePath && filePath.includes('/posts/')) {
                const parts = filePath.split('/posts/')[1].split('-');
                postNumber = parts.length > 0 ? parts[0] : '0';
            }
            frontmatter.twitterImg = getTwitterImage(postNumber);
        }
	};
}

export default defineConfig({
	prefetch: true,
	integrations: [tailwind()],
	markdown: {
			remarkPlugins: [defaultLayoutPlugin],
			rehypePlugins: [rehypeCustomizeImageSrc],
	},
});
