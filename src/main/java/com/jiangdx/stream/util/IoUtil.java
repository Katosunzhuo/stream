package com.jiangdx.stream.util;

import java.io.Closeable;
import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;

/**
 * IO--closing, getting file name ... main function method
 */
public class IoUtil {
	/** where the file should be put on. */
	public static final String REPOSITORY = System.getProperty("java.io.tmpdir", "/tmp/upload-repository");
	static final String CONTENT_HEADER = "content-disposition";
	/**
	 * From the uploaded Part, extract its file name.
	 */
	public static String getFileName(final Part part) {
		String key = null;
		for (String cd : part.getHeader(CONTENT_HEADER).split(";")) {
			if (cd.trim().startsWith("filename")) {
				key = cd.substring(cd.indexOf('=') + 1).trim()
						.replace("\"", "");
				break;
			}
		}
		return key;
	}
	
	public static String generateKey(String name, String size) {
		String key = UUID.randomUUID().toString();
//		key = name.hashCode() + "_" + size;
		return key;
	}
	
	public static Part getFilePart(HttpServletRequest request)
			throws IOException, ServletException {
		Collection<Part> parts = request.getParts();
		for (Part part : parts) {
			if (getFileName(part) != null)
				return part;
		}
		return null;
	}
	
	/**
	 * According the key, generate a file (if not exist, then create
	 * a new file).
	 * @param key
	 * @return
	 * @throws IOException
	 */
	public static File getFile(String key) throws IOException {
		if (key == null || key.isEmpty())
			return null;

		File f = new File(REPOSITORY + File.separator + key);
		if (!f.getParentFile().exists())
			f.getParentFile().mkdirs();
		if (!f.exists())
			f.createNewFile();
		
		return f;
	}
	
	/**
	 * close the IO stream.
	 * @param stream
	 */
	public static void close(Closeable stream) {
		try {
			if (stream != null)
				stream.close();
		} catch (IOException e) {
		}
	}
}
