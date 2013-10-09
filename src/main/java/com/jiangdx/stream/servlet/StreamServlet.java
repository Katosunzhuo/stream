package com.jiangdx.stream.servlet;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import com.jiangdx.stream.util.IoUtil;

/**
 * File reserved servlet, mainly reading the request parameter and its file
 * part, stored it.
 */
public class StreamServlet extends HttpServlet {
	private static final long serialVersionUID = -8619685235661387895L;
	static final String CROSS_ORIGIN = "CROSS_ORIGIN";
	private String origins;
	/** when the has increased to 10kb, then flush it to the hard-disk. */
	static final int BUFFER_LENGTH = 10240;
	static final String START_FIELD = "start";
	public static final String CONTENT_RANGE_HEADER = "content-range";

	@Override
	public void init() throws ServletException {
		origins = getServletContext().getInitParameter(CROSS_ORIGIN);
	}
	
	/**
	 * Lookup where's the position of this file?
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		doOptions(req, resp);

		final String token = req.getParameter(TokenServlet.TOKEN_FIELD);
		final String size = req.getParameter(TokenServlet.FILE_SIZE_FIELD);
		final String fileName = req.getParameter(TokenServlet.FILE_NAME_FIELD);
		final PrintWriter writer = resp.getWriter();
		
		/** TODO: validate your token. */
		
		JSONObject json = new JSONObject();
		long start = 0;
		boolean success = true;
		String message = "";
		try {
			File f = IoUtil.getFile(token);
			start = f.length();
			/** file size is 0 bytes. */
			if (token.endsWith("_0") && "0".equals(size) && 0 == start)
				f.renameTo(IoUtil.getFile(fileName));
		} catch (FileNotFoundException fne) {
			message = "Error: " + fne.getMessage();
			success = false;
		} finally {
			try {
				if (success)
					json.put(START_FIELD, start);
				json.put(TokenServlet.SUCCESS, success);
				json.put(TokenServlet.MESSAGE, message);
			} catch (JSONException e) {}
			
			writer.write(json.toString());
			IoUtil.close(writer);
		}
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		doOptions(req, resp);
		
		final String token = req.getParameter(TokenServlet.TOKEN_FIELD);
		final String fileName = req.getParameter(TokenServlet.FILE_NAME_FIELD);
		Range range = IoUtil.parseRange(req);
		
		OutputStream out = null;
		InputStream content = null;
		final PrintWriter writer = resp.getWriter();
		
		/** TODO: validate your token. */
		
		JSONObject json = new JSONObject();
		long start = 0;
		boolean success = true;
		String message = "";
		try {
			File f = IoUtil.getFile(token);
			if (f.length() != range.getFrom())
				throw new IOException("File from position error!");
			
			out = new FileOutputStream(f, true);
			content = req.getInputStream();
			int read = 0;
			final byte[] bytes = new byte[BUFFER_LENGTH];
			while ((read = content.read(bytes)) != -1)
				out.write(bytes, 0, read);

			start = f.length();
			/** rename the file */
			if (range.getSize() == start)
				f.renameTo(IoUtil.getFile(fileName));
		} catch (FileNotFoundException fne) {
			message = "Error: " + fne.getMessage();
			success = false;
		} finally {
			try {
				if (success)
					json.put(START_FIELD, start);
				json.put(TokenServlet.SUCCESS, success);
				json.put(TokenServlet.MESSAGE, message);
			} catch (JSONException e) {}
			
			writer.write(json.toString());
			IoUtil.close(out);
			IoUtil.close(content);
			IoUtil.close(writer);
		}
	}
	
	@Override
	protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		resp.setContentType("application/json");
		resp.setHeader("Access-Control-Allow-Headers", "Content-Range,Content-Type");
		resp.setHeader("Access-Control-Allow-Origin", origins);
		resp.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	}

	@Override
	public void destroy() {
		super.destroy();
	}

}
