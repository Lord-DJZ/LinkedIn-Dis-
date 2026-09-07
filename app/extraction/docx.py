from typing import Tuple
import docx


class DOCXExtractor:
    """Extracts raw text from DOCX files including body paragraphs and tables."""

    MIN_TEXT_CHARS_THRESHOLD = 50

    @classmethod
    def extract_text(cls, file_path: str) -> Tuple[str, bool]:
        """
        Extracts clean text from a DOCX file.
        Returns: (extracted_text, is_scanned)
        """
        doc = docx.Document(file_path)
        text_elements = []

        # Extract regular paragraphs
        for para in doc.paragraphs:
            stripped = para.text.strip()
            if stripped:
                text_elements.append(stripped)

        # Extract text in tables
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    text_elements.append(row_text)

        combined_text = "\n\n".join(text_elements).strip()
        is_empty = len(combined_text) < cls.MIN_TEXT_CHARS_THRESHOLD
        return combined_text, is_empty
