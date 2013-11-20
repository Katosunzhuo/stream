package cn.twinkling.stream.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import cn.twinkling.stream.util.TokenUtil;

/**
 * According the file name and its size, generate a unique token. And this
 * token will be refer to user's file.
 */
public class TokenServlet extends HttpServlet {
	private static final long serialVersionUID = 2650340991003623753L;
	static final String FILE_NAME_FIELD = "name";
	static final String FILE_SIZE_FIELD = "size";
	static final String TOKEN_FIELD = "token";
	static final String SERVER_FIELD = "server";
	static final String SUCCESS = "success";
	static final String MESSAGE = "message";
	
	/** mark it whether cross domain for uploading */
	static final String CROSS = "CROSS";
	static final String SERVER = "SERVER";
	boolean cross = false;
	String server = null;
	
	@Override
	public void init() throws ServletException {
		cross = Boolean.parseBoolean(getInitParameter(CROSS));
		server = getInitParameter(SERVER);
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String name = req.getParameter(FILE_NAME_FIELD);
		String size = req.getParameter(FILE_SIZE_FIELD);
		String token = TokenUtil.generateToken(name, size);
		
		PrintWriter writer = resp.getWriter();
		
		JSONObject json = new JSONObject();
		try {
			json.put(TOKEN_FIELD, token);
			if (cross)
				json.put(SERVER_FIELD, server);
			json.put(SUCCESS, true);
			json.put(MESSAGE, "");
		} catch (JSONException e) {
		}
		/** TODO: save the token. */
		
		writer.write(json.toString());
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
