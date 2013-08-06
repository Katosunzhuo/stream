package com.jiangdx.stream.servlet;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.jiangdx.stream.util.IoUtil;

/**
 * File uploaded status querying.
 */
@WebServlet(name = "LookupServlet", urlPatterns = { "/lookup" })
public class LookupServlet extends HttpServlet {
	private static final long serialVersionUID = -813676161252424924L;
	static final String KEY_FIELD = "key";

	@Override
	public void init() throws ServletException {
		super.init();
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String key = req.getParameter(KEY_FIELD);
		File f = IoUtil.getFile(key);
		long start = f.length();
		
		PrintWriter writer = resp.getWriter();
		StringBuilder buf = new StringBuilder("{");
		buf.append("start:").append(start).append("}");
		writer.write(buf.toString());
	}

	@Override
	protected void doHead(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.doHead(req, resp);
	}

	@Override
	public void destroy() {
		super.destroy();
	}

}
