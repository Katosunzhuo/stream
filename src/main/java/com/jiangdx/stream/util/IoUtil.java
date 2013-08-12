package com.jiangdx.stream.util;

import java.io.Closeable;
import java.io.File;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import com.jiangdx.stream.servlet.Range;
import com.jiangdx.stream.servlet.StreamServlet;

/**
 * IO--closing, getting file name ... main function method
 */
public class IoUtil {
	static final Pattern RANGE_PATTERN = Pattern.compile("bytes \\d+-\\d+/\\d+");
	/** where the file should be put on. */
	public static final String REPOSITORY = System.getProperty("java.io.tmpdir", "/tmp/upload-repository");
	
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
	
	/**
	 * 获取Range参数
	 * @param req
	 * @return
	 * @throws IOException
	 */
	public static Range parseRange(HttpServletRequest req) throws IOException {
		String range = req.getHeader(StreamServlet.CONTENT_RANGE_HEADER);
		Matcher m = RANGE_PATTERN.matcher(range);
		if (m.find()) {
			range = m.group().replace("bytes ", "");
			String[] rangeSize = range.split("/");
			String[] fromTo = rangeSize[0].split("-");

			long from = Long.parseLong(fromTo[0]);
			long to = Long.parseLong(fromTo[1]);
			long size = Long.parseLong(rangeSize[1]);

			return new Range(from, to, size);
		}
		throw new IOException("Illegal Access!");
	}

}
