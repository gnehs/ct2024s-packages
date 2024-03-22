from PIL import Image, ImageDraw
import cv2
import numpy as np
import os
import json


def read_json(file, unicode_num):
    with open(file) as f:
        p = json.load(f)
        unicode_list = ['']*unicode_num
        for i in range(unicode_num):
            # ex: 0x1234 --> U+1234
            unicode_list[i] = 'U+' + p['CP950'][i]['UNICODE'][2:6]
        return unicode_list


def scale_adjustment(word_img, code):
    """調整文字大小、重心並自動裁剪左右白色區塊，將高度調整為300

    Keyword arguments:
        word_img -- 文字圖片
    """

    isCJK = False
    isPunctuation = False
    # 中日韓統一表意文字列表
    # U+4E00-U+9FFF
    if 0x4e00 <= int(code[2:], 16) <= 0x9fff:
        isCJK = True
    # CJK-punctuation font
    # U+3002, U+FF0E, U+FF0C, U+3001, U+FF1B, U+FF1A, U+FF1F, U+FF01,
    # U+2014, U+2026,
    # U+300A-300B, U+3008-3009, U+FF08-FF09, /* brackets */
    # U+300C-300F /* quotes */;
    if [
        0x3002, 0xff0e, 0xff0c, 0x3001, 0xff1b, 0xff1a,
        0xff1f, 0xff01, 0x2014, 0x2026,
        0x300a, 0x300b,  0x3008, 0x3009, 0xff08, 0xff09,  # brackets
        0x300c,  0x300d, 0x300e, 0x300f  # quotes
    ].count(int(code[2:], 16)) > 0:
        isPunctuation = True

    word_img = np.array(word_img)
    word_img_copy = cv2.copyMakeBorder(
        word_img, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=(255, 255, 255))

    # 二值化處理
    binary_word_img = cv2.cvtColor(word_img_copy, cv2.COLOR_BGR2GRAY) if len(
        word_img_copy.shape) == 3 else word_img_copy
    binary_word_img = cv2.threshold(
        binary_word_img, 127, 255, cv2.THRESH_BINARY_INV)[1]

    # 取得文字 Bounding Box
    topLeftX, topLeftY, word_w, word_h = cv2.boundingRect(binary_word_img)
    max_length = max(word_w, word_h) + 10
    # 計算質心
    cX, cY = topLeftX + word_w // 2, topLeftY + word_h // 2  # 幾何中心

    # 自動裁剪左右白色區塊
    h, w = word_img_copy.shape
    left_x = topLeftX
    right_x = topLeftX + word_w - 1

    # 數值越大文字越小，數值越小文字越大
    crop_length = max(max_length, 280) if isCJK else 300
    top_y = max(0, cY - int(crop_length/2))
    bot_y = min(h, cY + int(crop_length/2))

    # 不調整非 CJK 字元的高度
    if not isCJK:
        y_crop = 60
        top_y = y_crop
        bot_y = h - y_crop
    if isPunctuation:
        y_crop = 60
        left_x = y_crop
        right_x = w - y_crop
    final_word_img = word_img_copy[top_y:bot_y, left_x:right_x]

    # 將高度調整為300
    aspect_ratio = float(300) / final_word_img.shape[0]
    resized_word_img = cv2.resize(
        final_word_img, (int(final_word_img.shape[1] * aspect_ratio), 300))
    return resized_word_img


def crop_boxes(image_folder, start_page, end_page, min_box_size, padding, json_path, unicode_num):
    # 讀取圖片
    unicode_list = read_json(json_path, unicode_num)
    # k = 0
    k = (start_page-1)*100
    for page in range(start_page, end_page):
        # 構建檔案名稱
        image_file = f"{page}.png"
        print(f"Processing {image_file}...")
        # 圖片路徑
        image_path = os.path.join(image_folder, image_file)

        # 讀取圖片
        img_np = cv2.imread(image_path, cv2.IMREAD_COLOR)
        # 將圖片轉為灰階
        gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)

        # 使用二值化處理，使方框更容易被檢測
        _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

        # 使用輪廓檢測方框
        contours, _ = cv2.findContours(
            binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # 對輪廓進行處理，將 y 值相差小於 10 的視為同一行
        contours = sorted(contours, key=lambda x: (
            cv2.boundingRect(x)[1] // 120, cv2.boundingRect(x)[0]))

        # 確保目錄存在
        output_directory = 'crop_v5'
        os.makedirs(output_directory, exist_ok=True)

        for i, contour in enumerate(contours):
            x, y, w, h = cv2.boundingRect(contour)

            # 內縮方框
            x += padding
            y += padding
            w -= 2 * padding
            h -= 2 * padding

            # 略過小於閾值的方框
            if w >= min_box_size and h >= min_box_size and abs(w-h) < 100:
                img_np = cv2.rectangle(
                    img_np, (x, y), (x+w, y+h), (255, 255, 255), 30)
                # 裁切方框
                cropped_image = Image.fromarray(cv2.cvtColor(
                    img_np[y:y+h, x:x+w], cv2.COLOR_BGR2RGB))
                cropped_image = np.array(cropped_image)
                cropped_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2GRAY)
                median_filtered = cv2.medianBlur(cropped_image, 3)
                kernel = np.ones((2, 2), np.uint8)
                processed_image = cv2.morphologyEx(
                    median_filtered, cv2.MORPH_OPEN, kernel)
                connectivity, labels, stats, centroids = cv2.connectedComponentsWithStats(
                    processed_image, connectivity=8)
                for i in range(1, connectivity):
                    area = stats[i, cv2.CC_STAT_AREA]
                    if area < min_area_threshold:
                        processed_image[labels == i] = 0

                cropped_image = scale_adjustment(
                    processed_image, unicode_list[k])
                # space
                if unicode_list[k] == 'U+0020':
                    # generate a white image
                    cropped_image = np.ones((300, 150), np.uint8) * 255
                # tab
                if unicode_list[k] == 'U+0009':
                    # generate a white image
                    cropped_image = np.ones((300, 300), np.uint8) * 255

                cv2.imwrite(os.path.join(output_directory,
                            f'{unicode_list[k]}.png'), cropped_image)
                k += 1
                # 在OpenCV中繪製藍色的邊框
                cv2.rectangle(img_np, (x, y), (x+w, y+h), (255, 0, 0), 30)

                if k == unicode_num:
                    break

        bound_output_directory = 'rec_bound_v5'
        os.makedirs(bound_output_directory, exist_ok=True)
        cv2.imwrite(os.path.join(
            bound_output_directory, f'{page}.png'), img_np)


if __name__ == "__main__":
    image_folder = "/Users/gnehs/Downloads/Gray_manuscript-main/gray_crop/rotated_109AB0032"
    start_page = 1
    # get the last page number
    image_folder_list = os.listdir(image_folder)
    end_page = len(image_folder_list)
    min_box_size = 300  # 設定閾值，只保留寬和高都大於等於這個值的方框
    min_area_threshold = 0
    padding = 0  # 內縮的像素數量
    json_path = "CP950.json"  # 請替換為你的 JSON 檔案路徑
    unicode_num = 5345

    crop_boxes(image_folder, start_page, end_page,
               min_box_size, padding, json_path, unicode_num)
