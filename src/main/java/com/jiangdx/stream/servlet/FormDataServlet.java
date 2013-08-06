package com.jiangdx.stream.servlet;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.jiangdx.stream.util.IoUtil;

/**
 * FormData Uploading reserved servlet, mainly reading the request parameter and
 * its file part, stored it.
 */
public class FormDataServlet extends HttpServlet {
	private static final long serialVersionUID = -1905516389350395696L;
	static final String FILE_FIELD = "file";
	/** when the has increased to 10kb, then flush it to the hard-disk. */
	static final int BUFFER_LENGTH = 10240;
	static final int MAX_FILE_SIZE = 1024 * 1024 * 100;

	@Override
	public void init() throws ServletException {
		super.init();
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/html;charset=UTF-8");
		DiskFileItemFactory factory = new DiskFileItemFactory();

		// 设置临时目录
		factory.setRepository(new File(IoUtil.REPOSITORY));
		// 设置上传文件大小
		factory.setSizeThreshold(MAX_FILE_SIZE);
		// 创建一个ServletFileUpload 实例
		ServletFileUpload sfu = new ServletFileUpload(factory);

		try {
			// 解析请求,取得FileItem 列表
			List<FileItem> lis = sfu.parseRequest(req);
			// 循环遍历
			for (FileItem item : lis) {
				// 判断是否是简单的表单字段
				if (item.isFormField()) {
					String name = item.getFieldName();
					String value = item.getString();
					System.out.println(name + ":" + value);
				} else {
					uploading(item, response);
				}
			}
		} catch (FileUploadException e) {
			e.printStackTrace();
		}
	}

	private void uploading(FileItem item, HttpServletResponse response)
			throws IOException {
		OutputStream out = null;
		InputStream content = null;
		final PrintWriter writer = response.getWriter();

		try {
			String fileName = item.getName();
			File f = IoUtil.getFile(fileName);
			out = new FileOutputStream(f);
			content = item.getInputStream();

			int read = 0;
			final byte[] bytes = new byte[BUFFER_LENGTH];
			while ((read = content.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}

			long start = f.length();
			StringBuilder buf = new StringBuilder("{");
			buf.append("start:").append(start).append("}");
			writer.write(buf.toString());
		} catch (FileNotFoundException fne) {
			writer.println("<br/> ERROR: " + fne.getMessage());
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
