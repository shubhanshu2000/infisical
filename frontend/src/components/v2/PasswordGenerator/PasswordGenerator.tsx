import { useEffect, useRef, useState } from "react";
import { faCopy, faKey, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button, Checkbox, IconButton, Slider } from "@app/components/v2";

type PasswordOptionsType = {
  length: number;
  useUppercase: boolean;
  useLowercase: boolean;
  useNumbers: boolean;
  useSpecialChars: boolean;
};

type PasswordGeneratorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUsePassword?: (password: string) => void;
  minLength?: number;
  maxLength?: number;
};

const PasswordGeneratorModal = ({
  isOpen,
  onClose,
  onUsePassword,
  minLength = 6,
  maxLength = 32
}: PasswordGeneratorModalProps) => {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptionsType>({
    length: minLength,
    useUppercase: true,
    useLowercase: true,
    useNumbers: true,
    useSpecialChars: true
  });

  const modalRef = useRef<HTMLDivElement>(null);

  const generatePassword = () => {
    const charset = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      specialChars: "-_.~!*"
    };

    let availableChars = "";
    if (passwordOptions.useUppercase) availableChars += charset.uppercase;
    if (passwordOptions.useLowercase) availableChars += charset.lowercase;
    if (passwordOptions.useNumbers) availableChars += charset.numbers;
    if (passwordOptions.useSpecialChars) availableChars += charset.specialChars;

    if (availableChars === "") availableChars = charset.lowercase + charset.numbers;

    let newPassword = "";
    for (let i = 0; i < passwordOptions.length; i += 1) {
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      newPassword += availableChars[randomIndex];
    }

    setPassword(newPassword);
    setCopied(false);
  };

  useEffect(() => {
    if (isOpen) {
      generatePassword();

      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {};
  }, [isOpen, onClose]);

  useEffect(() => {
    generatePassword();
  }, [passwordOptions]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const usePassword = () => {
    if (onUsePassword) {
      onUsePassword(password);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg border border-mineshaft-600 bg-mineshaft-800 shadow-xl"
      >
        <div className="p-6">
          <h2 className="mb-1 text-xl font-semibold text-bunker-200">Password Generator</h2>
          <p className="mb-6 text-sm text-bunker-400">Generate strong unique passwords</p>

          <div className="relative mb-4 rounded-md bg-mineshaft-900 p-4">
            <div className="flex items-center justify-between">
              <div className="w-4/5 select-all break-all pr-2 font-mono text-lg">{password}</div>
              <div className="flex flex-col gap-1">
                <Button
                  size="xs"
                  colorSchema="secondary"
                  variant="outline_bg"
                  onClick={generatePassword}
                  className="w-full text-bunker-300 hover:text-bunker-100"
                >
                  <FontAwesomeIcon icon={faRefresh} className="mr-1 h-3 w-3" />
                  Refresh
                </Button>

                <Button
                  size="xs"
                  colorSchema="secondary"
                  variant="outline_bg"
                  onClick={copyToClipboard}
                  className="w-full text-bunker-300 hover:text-bunker-100"
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-1 h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password-length" className="text-sm text-bunker-300">
                Password length: {passwordOptions.length}
              </label>
            </div>
            <Slider
              id="password-length"
              min={minLength}
              max={maxLength}
              value={passwordOptions.length}
              onChange={(value) => setPasswordOptions({ ...passwordOptions, length: value })}
              className="mb-1"
              aria-labelledby="password-length-label"
            />
          </div>

          <div className="mb-6 flex flex-row justify-between gap-2">
            <Checkbox
              id="useUppercase"
              className="mr-2 data-[state=checked]:bg-primary"
              isChecked={passwordOptions.useUppercase}
              onCheckedChange={(checked) =>
                setPasswordOptions({ ...passwordOptions, useUppercase: checked as boolean })
              }
            >
              A-Z
            </Checkbox>

            <Checkbox
              id="useLowercase"
              className="mr-2 data-[state=checked]:bg-primary"
              isChecked={passwordOptions.useLowercase}
              onCheckedChange={(checked) =>
                setPasswordOptions({ ...passwordOptions, useLowercase: checked as boolean })
              }
            >
              a-z
            </Checkbox>

            <Checkbox
              id="useNumbers"
              className="mr-2 data-[state=checked]:bg-primary"
              isChecked={passwordOptions.useNumbers}
              onCheckedChange={(checked) =>
                setPasswordOptions({ ...passwordOptions, useNumbers: checked as boolean })
              }
            >
              0-9
            </Checkbox>

            <Checkbox
              id="useSpecialChars"
              className="mr-2 data-[state=checked]:bg-primary"
              isChecked={passwordOptions.useSpecialChars}
              onCheckedChange={(checked) =>
                setPasswordOptions({ ...passwordOptions, useSpecialChars: checked as boolean })
              }
            >
              -_.~!*
            </Checkbox>
          </div>

          <div className="flex justify-end">
            <Button size="sm" colorSchema="primary" variant="outline_bg" onClick={onClose}>
              Close
            </Button>
            {onUsePassword && (
              <Button
                size="sm"
                colorSchema="primary"
                variant="outline_bg"
                onClick={usePassword}
                className="ml-2"
              >
                Use Password
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export type PasswordGeneratorProps = {
  onUsePassword?: (password: string) => void;
  isDisabled?: boolean;
  minLength?: number;
  maxLength?: number;
};

export const PasswordGenerator = ({
  onUsePassword,
  isDisabled = false,
  minLength = 6,
  maxLength = 32
}: PasswordGeneratorProps) => {
  const [showGenerator, setShowGenerator] = useState(false);

  const toggleGenerator = () => {
    setShowGenerator(!showGenerator);
  };

  return (
    <>
      <IconButton
        ariaLabel="generate password"
        colorSchema="secondary"
        size="sm"
        onClick={toggleGenerator}
        isDisabled={isDisabled}
        className="rounded text-bunker-400 transition-colors duration-150 hover:bg-mineshaft-700 hover:text-bunker-200"
      >
        <FontAwesomeIcon icon={faKey} />
      </IconButton>

      <PasswordGeneratorModal
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onUsePassword={onUsePassword}
        minLength={minLength}
        maxLength={maxLength}
      />
    </>
  );
};
