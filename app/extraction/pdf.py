from typing import Tuple
import pymupdf



class PDFExtractor:
    """Extracts raw text from PDF files using PyMuPDF without any AI dependency."""

    MIN_TEXT_CHARS_THRESHOLD = 50

    @classmethod
    def extract_text(cls, file_path: str) -> Tuple[str, bool]:
        """
        Extracts clean text from a PDF file.
        Returns: (extracted_text, is_scanned)
        """
        doc = pymupdf.open(file_path)

        full_text_pages = []

        try:
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_text = page.get_text("text")
                if page_text:
                    full_text_pages.append(page_text.strip())

            combined_text = "\n\n".join(full_text_pages).strip()
            total_chars = len(combined_text)

            # Check for scanned PDF (little or no machine-readable unicode text)
            is_scanned = total_chars < cls.MIN_TEXT_CHARS_THRESHOLD
            return combined_text, is_scanned
        finally:
            doc.close()
