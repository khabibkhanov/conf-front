export default function LanguageSelector({ onLanguageChange }) {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'es', name: 'Spanish' },
    // Add more languages as needed
  ];

  return (
    <div>
      <label htmlFor="language">Choose a language:</label>
      <select id="language" onChange={(e) => onLanguageChange(e.target.value)}>
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
