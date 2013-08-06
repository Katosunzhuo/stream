package com.jiangdx.stream.servlet;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.Collection;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import com.jiangdx.stream.util.IoUtil;

/**
 * File reserved servlet, mainly reading the request parameter and its file
 * part, stored it.
 */
@WebServlet(name = "StreamServlet", urlPatterns = { "/upload" })
@MultipartConfig
public class StreamServlet extends HttpServlet {
	private static final long serialVersionUID = -8619685235661387895L;
	static final String FILE_FIELD = "file";
	/** when the has increased to 10kb, then flush it to the hard-disk. */
	static final int BUFFER_LENGTH = 10240;

	@Override
	public void init() throws ServletException {
		super.init();
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/html;charset=UTF-8");

		// Create path components to save the file
		final String path = req.getParameter("destination");
		
		Part filePart = null;
		Collection<Part> parts = req.getParts();
		for (Part part : parts) {
			if (part != null) {
				filePart = part;
				break;
			}
		}
		final String fileName = IoUtil.getFileName(filePart);

		OutputStream out = null;
		InputStream content = null;
		final PrintWriter writer = response.getWriter();

		try {
			out = new FileOutputStream(IoUtil.getFile(fileName));
			content = filePart.getInputStream();

			int read = 0;
			final byte[] bytes = new byte[BUFFER_LENGTH];
			while ((read = content.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}
			writer.println("New file " + fileName + " created at " + path);
//			LOGGER.log(Level.INFO, "File{0}being uploaded to {1}",
//					new Object[] { fileName, path });
		} catch (FileNotFoundException fne) {
			writer.println("You either did not specify a file to upload or are "
					+ "trying to upload a file to a protected or nonexistent "
					+ "location.");
			writer.println("<br/> ERROR: " + fne.getMessage());

//			LOGGER.log(Level.SEVERE, "Problems during file upload. Error: {0}",
//					new Object[] { fne.getMessage() });
		} finally {
			IoUtil.close(out);
			IoUtil.close(content);
			IoUtil.close(writer);
		}
	}

	@Override
	public void destroy() {
		super.destroy();
	}

}
