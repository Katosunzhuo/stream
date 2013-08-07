package com.jiangdx.stream.servlet;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.jiangdx.stream.util.IoUtil;

/**
 * File reserved servlet, mainly reading the request parameter and its file
 * part, stored it.
 */
public class StreamServlet extends HttpServlet {
	private static final long serialVersionUID = -8619685235661387895L;
	/** when the has increased to 10kb, then flush it to the hard-disk. */
	static final int BUFFER_LENGTH = 10240;
	static final String START_FIELD = "start";
	static final String CONTENT_RANGE_HEADER = "content-range";

	@Override
	public void init() throws ServletException {
		super.init();
	}

	/**
	 * Lookup where's the position of this file?
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		resp.setContentType("text/html;charset=UTF-8");

		final String key = req.getParameter(TokenServlet.TOKEN_FIELD);
		final PrintWriter writer = resp.getWriter();
		try {
			File f = IoUtil.getFile(key);
			long start = f.length();
			StringBuilder buf = new StringBuilder("{");
			buf.append(START_FIELD).append(":").append(start)
					.append("}");
			writer.write(buf.toString());
		} catch (FileNotFoundException fne) {
			writer.println("<br/> ERROR: " + fne.getMessage());
		} finally {
			IoUtil.close(writer);
		}
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/html;charset=UTF-8");

		final String token = req.getParameter(TokenServlet.TOKEN_FIELD);
		final String fileName = req.getParameter(TokenServlet.FILE_NAME_FIELD);
		Range range = parseRange(req);
		
		OutputStream out = null;
		InputStream content = null;
		final PrintWriter writer = response.getWriter();
		try {
			File f = IoUtil.getFile(token);
			if (f.length() != range.getFrom())
				throw new IOException("File from position error!");
			
			out = new FileOutputStream(f, true);
			content = req.getInputStream();
			int read = 0;
			final byte[] bytes = new byte[BUFFER_LENGTH];
			while ((read = content.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}

			long start = f.length();
			/** rename the file */
			if (range.getSize() == start)
				f.renameTo(IoUtil.getFile(fileName));

			StringBuilder buf = new StringBuilder("{");
			buf.append(START_FIELD).append(":").append(start).append("}");
			writer.write(buf.toString());
		} catch (FileNotFoundException fne) {
			writer.println("<br/> ERROR: " + fne.getMessage());
		} finally {
			IoUtil.close(out);
			IoUtil.close(content);
			IoUtil.close(writer);
		}
	}
	
	private Range parseRange(HttpServletRequest req) throws IOException {
		String range = req.getHeader(CONTENT_RANGE_HEADER);
		String regex = "bytes \\d+-\\d+/\\d+";
		Pattern p = Pattern.compile(regex);
		Matcher m = p.matcher(range);
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

	@Override
	public void destroy() {
		super.destroy();
	}

}
