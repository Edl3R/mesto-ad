/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement, updateLikeDisplay } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
    getUserInfo,
    getCardList,
    setUserInfo,
    setUserAvatar,
    createCard,
    deleteCard,
    changeLikeCardStatus,
} from "./components/api.js";

const validationSettings = {
    formSelector: ".popup__form",
    inputSelector: ".popup__input",
    submitButtonSelector: ".popup__button",
    inactiveButtonClass: "popup__button_disabled",
    inputErrorClass: "popup__input_type_error",
    errorClass: "popup__error_visible",
};

let userId = null;

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileFormButton = profileForm.querySelector(".popup__button");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardFormButton = cardForm.querySelector(".popup__button");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarFormButton = avatarForm.querySelector(".popup__button");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardButton = removeCardForm.querySelector(".popup__button");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUsersList = cardInfoModalWindow.querySelector(".popup__list");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

let cardToDelete = null;

const handlePreviewPicture = ({ name, link }) => {
    imageElement.src = link;
    imageElement.alt = name;
    imageCaption.textContent = name;
    openModalWindow(imageModalWindow);
};

const renderCardElement = (cardData) => {
    return createCardElement(
        cardData,
        {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCardClick,
            onCardInfo: handleCardInfoClick,
            userId,
        }
    );
};

const updateProfileDisplay = (userData) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
};

const updateCardDisplay = (cardsData) => {
    placesWrap.innerHTML = "";
    cardsData.forEach((cardData) => {
        placesWrap.append(renderCardElement(cardData));
    });
};

const handleProfileFormSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.submitter || profileFormButton;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Сохранение...";
    submitButton.disabled = true;

    setUserInfo({
        name: profileTitleInput.value,
        about: profileDescriptionInput.value,
    })
        .then((userData) => {
            updateProfileDisplay(userData);
            closeModalWindow(profileFormModalWindow);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
};

const handleAvatarFormSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.submitter || avatarFormButton;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Сохранение...";
    submitButton.disabled = true;

    setUserAvatar(avatarInput.value)
        .then((userData) => {
            profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
            closeModalWindow(avatarFormModalWindow);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
};

const handleCardFormSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.submitter || cardFormButton;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Создание...";
    submitButton.disabled = true;

    createCard({
        name: cardNameInput.value,
        link: cardLinkInput.value,
    })
        .then((newCard) => {
            placesWrap.prepend(renderCardElement(newCard));
            cardForm.reset();
            clearValidation(cardForm, validationSettings);
            closeModalWindow(cardFormModalWindow);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
};

const handleLikeCard = (likeButton, cardId, isCurrentlyLiked) => {
    changeLikeCardStatus(cardId, isCurrentlyLiked)
        .then((updatedCard) => {
            updateLikeDisplay(likeButton, updatedCard, !isCurrentlyLiked);
        })
        .catch((err) => {
            console.log(err);
        });
};

const handleDeleteCardClick = (cardId, cardElement) => {
    cardToDelete = { cardId, cardElement };
    openModalWindow(removeCardModalWindow);
};

const handleRemoveCardFormSubmit = (evt) => {
    evt.preventDefault();
    if (!cardToDelete) return;

    const submitButton = evt.submitter || removeCardButton;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Удаление...";
    submitButton.disabled = true;

    deleteCard(cardToDelete.cardId)
        .then(() => {
            cardToDelete.cardElement.remove();
            cardToDelete = null;
            closeModalWindow(removeCardModalWindow);
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
};

const formatDate = (date) =>
    date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

const createInfoString = (term, description) => {
    const template = document.getElementById("popup-info-definition-template");
    const element = template.content.cloneNode(true);
    element.querySelector(".popup__info-term").textContent = term;
    element.querySelector(".popup__info-description").textContent = description;
    return element;
};

const handleCardInfoClick = (cardId) => {
    getCardList()
        .then((updatedCards) => {
            const cardData = updatedCards.find((card) => card._id === cardId);
            if (!cardData) return;

            cardInfoModalTitle.textContent = "Информация о карточке";
            cardInfoModalList.innerHTML = "";

            cardInfoModalList.append(createInfoString("Описание:", cardData.name));
            cardInfoModalList.append(createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))));
            cardInfoModalList.append(createInfoString("Владелец:", cardData.owner.name));
            cardInfoModalList.append(createInfoString("Количество лайков:", cardData.likes.length.toString()));

            cardInfoModalText.textContent = "Лайкнули:";
            cardInfoModalUsersList.innerHTML = "";

            if (cardData.likes.length === 0) {
                const noLikesMessage = document.createElement("li");
                noLikesMessage.className = "popup__list-item popup__list-item_no-likes";
                noLikesMessage.textContent = "Никому не понравилось";
                cardInfoModalUsersList.append(noLikesMessage);
            } else {
                cardData.likes.forEach((user) => {
                    const template = document.getElementById("popup-info-user-preview-template");
                    const element = template.content.cloneNode(true);
                    element.querySelector(".popup__list-item").textContent = user.name;
                    cardInfoModalUsersList.append(element);
                });
            }

            openModalWindow(cardInfoModalWindow);
        })
        .catch((err) => {
            console.log(err);
        });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit);

openProfileFormButton.addEventListener("click", () => {
    profileTitleInput.value = profileTitle.textContent;
    profileDescriptionInput.value = profileDescription.textContent;
    clearValidation(profileForm, validationSettings);
    openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
    avatarForm.reset();
    clearValidation(avatarForm, validationSettings);
    openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
    cardForm.reset();
    clearValidation(cardForm, validationSettings);
    openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
    setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
    .then(([cardsData, userData]) => {
        userId = userData._id;
        updateProfileDisplay(userData);
        updateCardDisplay(cardsData);
    })
    .catch((err) => {
        console.log(err);
    });