package com.jiangdx.stream.servlet;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;

import com.jiangdx.stream.util.IoUtil;

/**
 * FormData Uploading reserved servlet, mainly reading the request parameter and
 * its file part, stored it.
 * PS: use the `streaming api`, this will not store it in a temporary file.
 * {@link http://commons.apache.org/proper/commons-fileupload/streaming.html }
 */
public class FormDataServlet extends HttpServlet {
	private static final long serialVersionUID = -1905516389350395696L;
	static final String FILE_FIELD = "file";
	/** when the has read to 10M, then flush it to the hard-disk. */
	public static final int BUFFER_LENGTH = 1024 * 1024 * 10;
	static final int MAX_FILE_SIZE = 1024 * 1024 * 100;

	@Override
	public void init() throws ServletException {
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		doOptions(req, resp);

		final PrintWriter writer = resp.getWriter();
		// Check that we have a file upload request
		boolean isMultipart = ServletFileUpload.isMultipartContent(req);
		if (!isMultipart) {
			writer.println("<br/> ERROR: It's not Multipart form.");
			return;
		}
		// Now we are ready to parse the request into its constituent items.
		// Here's how we do it:
		// Create a new file upload handler
		ServletFileUpload upload = new ServletFileUpload();
		InputStream in = null;
		String key = null;
		try {
			FileItemIterator iter = upload.getItemIterator(req);
			while (iter.hasNext()) {
				FileItemStream item = iter.next();
				String name = item.getFieldName();
				in = item.openStream();
				if (item.isFormField()) {
					String value = Streams.asString(in);
					System.out.println(name + ":" + value);
					if (TokenServlet.TOKEN_FIELD.equals(name))
						key = value;
				} else {
					String fileName = item.getName();
					long start = IoUtil.streaming(in, key, fileName);
					StringBuilder buf = new StringBuilder("{");
					buf.append(StreamServlet.START_FIELD).append(":")
							.append(start).append("}");
					writer.write(buf.toString());
				}
			}
		} catch (FileUploadException fne) {
			writer.println("<br/> ERROR: " + fne.getMessage());
		} finally {
			IoUtil.close(in);
			IoUtil.close(writer);
		}
	}

	@Override
	public void destroy() {
		super.destroy();
	}
}
