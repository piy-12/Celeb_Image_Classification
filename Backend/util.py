import joblib
import numpy as np
import base64
import json
import cv2
from wavelet import w2d

__class_name_to_number = {}
__class_number_to_name = {}
__model = None


def classify_image(image_base64_data, file_path=None):
    imgs = get_croppedimg_if_2_eyes(image_base64_data, file_path)

    result = []
    for img in imgs:
        scalled_raw_img = cv2.resize(img, (32, 32))
        img_har = w2d(img, 'db1', 5)
        scalled_har_img = cv2.resize(img_har, (32, 32))

        combined_img = np.vstack((
            scalled_raw_img.reshape(32*32*3, 1),
            scalled_har_img.reshape(32*32, 1)
        ))

        final = combined_img.reshape(1, -1).astype(float)

        pred = str(__model.predict(final)[0])   # already string
        result.append({
            "class" : pred,
            "class_probability": np.round(
    __model.predict_proba(final) * 100, 2
).tolist(),
            "class_dictionary" : __class_name_to_number
        })

    return result



def load_saved_artifacts():
    global __class_name_to_number
    global __class_number_to_name
    global __model

    print("Loading saved artifacts...")

    with open('./artifacts/class_dictionary.json', 'r') as f:
        __class_name_to_number = json.load(f)
        __class_number_to_name = {v: k for k, v in __class_name_to_number.items()}

    if __model is None:
        with open('./artifacts/saved_model.pkl', 'rb') as f:
            __model = joblib.load(f)

    print("Artifacts loaded successfully")


def get_cv2_image_from_base64_string(b64str):
    if "," in b64str:
        b64str = b64str.split(",")[1]

    npaar = np.frombuffer(base64.b64decode(b64str), np.uint8)
    return cv2.imdecode(npaar, cv2.IMREAD_COLOR)



def get_b64_test_image_for_virat():
    with open("b64.txt") as f:
        return f.read()


def get_croppedimg_if_2_eyes(image_base64_data, imagepath=None):
    faceCascade = cv2.CascadeClassifier(
        r"C:\Users\piyus\code\CelebrityFaceRecognition\model\opencv\haarcascades\haarcascade_frontalface_default.xml"
    )
    eyeCascade = cv2.CascadeClassifier(
        r"C:\Users\piyus\code\CelebrityFaceRecognition\model\opencv\haarcascades\haarcascade_eye.xml"
    )

    if faceCascade.empty() or eyeCascade.empty():
        raise Exception("Haarcascade XML files not loaded properly")

    img = cv2.imread(imagepath) if imagepath else get_cv2_image_from_base64_string(image_base64_data)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = faceCascade.detectMultiScale(gray, 1.2, 5)

    cropped_faces = []
    for (x, y, w, h) in faces:
        roi_gray = gray[y:y+h, x:x+w]
        roi_color = img[y:y+h, x:x+w]
        eyes = eyeCascade.detectMultiScale(roi_gray)

        if len(eyes) >= 2:
            cropped_faces.append(roi_color)

    return cropped_faces




if __name__ == '__main__':
    load_saved_artifacts()
    #print(classify_image(get_b64_test_image_for_virat(), None))
    print(classify_image(None, r"C:\Users\piyus\OneDrive\Desktop\ImageClassification\Backend\test_images\0b43460429.jpg"))
    print(classify_image(None, r"C:\Users\piyus\OneDrive\Desktop\ImageClassification\Backend\test_images\09Hunter1-superJumbo.jpg"))
