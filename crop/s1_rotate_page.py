"""
參考同學程式，旋轉稿紙角度

by kyL
"""

import os
import cv2
from tqdm import tqdm
from natsort import ns, natsorted
from jdeskew.estimator import get_angle
from jdeskew.utility import rotate


if __name__ == '__main__':
    student_id = '109AB0032'

    target_path = f'./{student_id}'  # !!! 目標資料夾 !!!
    result_path = f'rotated_{student_id}'  # 存放資料夾
    if not os.path.exists(result_path):
        os.makedirs(result_path)

    print(f"Handling page rotation, student id = {student_id}")

    errorList = []
    allFileList = os.listdir(target_path)
    allFileList = natsorted(allFileList, alg=ns.PATH)
    for index in tqdm(range(len(allFileList))):
        filePath = target_path + "/" + allFileList[index]
        image = cv2.imread(filePath)
        angle = get_angle(image)
        output_image = rotate(image, angle)
        cv2.imwrite('./{}/{}.png'.format(result_path,
                    f'{index+1}'), output_image)
