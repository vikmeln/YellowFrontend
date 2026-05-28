import { useRef, useState } from "react";
import { getErrorMessage, userApi, type UserProfile } from "../services/api";
import "./UserProfileModal.css";

type UserProfileModalProps = {
  open: boolean;
  session: any;
  profile: UserProfile | null;
  onClose: () => void;
  onProfileUpdated: (profile: UserProfile) => void;
};

const DEFAULT_AVATAR_URL = "/default-avatar.png";

function getProfileEmail(profile: UserProfile | null, session: any) {
  return (
    profile?.email ||
    profile?.Email ||
    session?.email ||
    session?.userName ||
    "Пользователь"
  );
}

function getProfileAvatar(profile: UserProfile | null) {
  return profile?.avatarUrl || profile?.AvatarUrl || DEFAULT_AVATAR_URL;
}

export default function UserProfileModal({
  open,
  session,
  profile,
  onClose,
  onProfileUpdated,
}: UserProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!open || !session) {
    return null;
  }

  async function uploadAvatar(file: File) {
    setError("");
    setMessage("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Можно загружать только JPG, PNG или WEBP.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Размер аватарки должен быть до 5 MB.");
    }

    setUploading(true);

    try {
      const result = await userApi.createAvatarUploadUrl(file.name, file.type);

      const uploadResponse = await fetch(result.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Ошибка загрузки аватарки: ${uploadResponse.status}`);
      }

      const updatedProfile = await userApi.updateAvatar(result.imageUrl);

      onProfileUpdated(updatedProfile);
      setMessage("Аватарка обновлена.");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      await uploadAvatar(file);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  const email = getProfileEmail(profile, session);
  const avatarUrl = getProfileAvatar(profile);

  return (
    <div className="modal-backdrop">
      <section className="modal profile-modal">
        <div className="modal-header">
          <h2>Профиль</h2>

          <button className="icon-button" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="profile-modal-body">
          <div className="profile-avatar-large">
            <img src={avatarUrl} alt="Аватар пользователя" />
          </div>

          <p className="profile-email">{email}</p>

          {session.role && <span className="user-pill">{session.role}</span>}

          {message && <p className="success-box full-width">{message}</p>}
          {error && <p className="error-box full-width">{error}</p>}

          <input
            ref={fileInputRef}
            className="hidden-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />

          <button
            className="primary"
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Изменяем..." : "Изменить аватарку"}
          </button>
        </div>
      </section>
    </div>
  );
}
