import type { PopsButtonStyleType } from "@whitesev/pops/dist/types/src/types/button";
import { UIButton } from "./ui-button";
import { ATTRIBUTE_INIT } from "../panel-config";
import { ShortCut, ShortCutKeyboardOption } from "./../../utils/ShortCut";
import { log } from "../../base.env";
import Qmsg from "qmsg";

/**
 * 获取录入快捷键配置
 * @param text 左边的文字
 * @param description 左边的文字下面的描述
 * @param key 存储该快捷键的键名
 * @param defaultValue 快捷键的默认值
 * @param defaultButtonText 按钮的文字
 * @param buttonType （可选）按钮的样式类型，默认为"default"
 * @param shortCut ShortCut的实例，用于纪录快捷键
 * @example
 * UIButtonShortCut(
 *   "左边的文字",
 *   "左边的文字下面的描述",
 *   "gf-quickReply",
 *   void 0,
 *   "点击录入快捷键",
 *   void 0,
 *   shortCut
 * )
 */
export const UIButtonShortCut = function (
	text: string,
	description: string | undefined,
	key: string,
	defaultValue: ShortCutKeyboardOption | undefined,
	defaultButtonText: string | (() => string),
	buttonType: PopsButtonStyleType = "default",
	shortCut: ShortCut
) {
	let __defaultButtonText =
		typeof defaultButtonText === "function"
			? defaultButtonText()
			: defaultButtonText;
	if (typeof defaultValue === "object") {
		// 初始化配置
		shortCut.initConfig(key, defaultValue);
	}
	// 获取按钮文字
	let getButtonText = () => {
		return shortCut.getShowText(key, __defaultButtonText);
	};
	let result = UIButton(
		text,
		description,
		getButtonText,
		"keyboard",
		false,
		false,
		buttonType,
		async (event) => {
			let $click = event.target as HTMLDivElement;
			let $btn = $click
				.closest(".pops-panel-button")
				?.querySelector<HTMLSpanElement>("span")!;
			if (shortCut.isWaitPress) {
				Qmsg.warning("请先执行当前的录入操作");
				return;
			}
			if (shortCut.hasOptionValue(key)) {
				// 存在快捷键
				shortCut.emptyOption(key);
				Qmsg.success("清空快捷键");
			} else {
				// 不存在快捷键
				// 录入快捷键
				let loadingQmsg = Qmsg.loading("请按下快捷键...", {
					showClose: true,
					onClose() {
						shortCut.cancelEnterShortcutKeys();
					},
				});
				let {
					status,
					option,
					key: isUsedKey,
				} = await shortCut.enterShortcutKeys(key);
				loadingQmsg.close();
				if (status) {
					log.success(["成功录入快捷键", option]);
					Qmsg.success("成功录入");
				} else {
					Qmsg.error(
						`快捷键 ${shortCut.translateKeyboardValueToButtonText(
							option
						)} 已被 ${isUsedKey} 占用`
					);
				}
			}
			$btn.innerHTML = getButtonText();
		}
	);
	result.attributes = {};
	Reflect.set(result.attributes, ATTRIBUTE_INIT, () => {
		return false;
	});
	return result;
};
