package com.lawfirm.management.document;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import static org.junit.jupiter.api.Assertions.*;

class DocumentServiceTest {
 @Test void shouldRejectEmptyFile(){ var file=new MockMultipartFile("file","x.pdf","application/pdf",new byte[0]); assertTrue(file.isEmpty()); }
 @Test void shouldKeepOriginalFilename(){ var file=new MockMultipartFile("file","peticao.pdf","application/pdf","abc".getBytes()); assertEquals("peticao.pdf",file.getOriginalFilename()); }
}
