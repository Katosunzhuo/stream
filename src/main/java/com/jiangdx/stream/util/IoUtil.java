package com.jiangdx.stream.util;

import java.io.Closeable;
import java.io.File;
import java.io.IOException;

import javax.servlet.http.Part;

/**
 * IO--closing, getting file name ... main function method
 */
public class IoUtil {
	/** where the file should be put on. */
	public static final String REPOSITORY = System.getProperty("java.io.tmpdir", "/tmp/upload-repository");
	
	/**
	 * From the uploaded Part, extract its file name.
	 */
	public static String getFileName(final Part part) {
//		final String partHeader = part.getHeader("content-disposition");
		// LOGGER.log(Level.INFO, "Part Header = {0}", partHeader);
		for (String content : part.getHeader("content-disposition").split(";")) {
			if (content.trim().startsWith("filename")) {
				return content.substring(content.indexOf('=') + 1).trim()
						.replace("\"", "");
			}
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
