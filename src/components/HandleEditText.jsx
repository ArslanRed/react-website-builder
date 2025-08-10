import React, { useEffect } from 'react';
import { useUserTheme } from '../contexts/UserThemeContext';
import EditableText from './EditableText';

export default function EditableTextController({ themeId }) {
  const { userThemeConfig, setUserThemeConfig } = useUserTheme();

  useEffect(() => {
    // same theme setup code as before...
  }, [themeId, setUserThemeConfig]);

  function onHeadingChange(newHeading) {
    setUserThemeConfig(prev => ({
      ...prev,
      content: { ...prev.content, heading: newHeading },
    }));
  }

  function onParagraphChange(newParagraph) {
    setUserThemeConfig(prev => ({
      ...prev,
      content: { ...prev.content, paragraph: newParagraph },
    }));
  }

  return (
    <div>
      <EditableText
        tag="input"
        text={userThemeConfig.content.heading}
        onChange={onHeadingChange}
        className="editable-heading"
        placeholder="Edit Heading"
      />
      <EditableText
        tag="textarea"
        text={userThemeConfig.content.paragraph}
        onChange={onParagraphChange}
        className="editable-paragraph"
        placeholder="Edit Paragraph"
      />
    </div>
  );
}
