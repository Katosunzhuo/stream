package cn.twinkling.stream.util;

import java.io.IOException;

/**
 * Key Util: 1> according file name|size ..., generate a key;
 * 			 2> the key should be unique.
 */
public class TokenUtil {

	/**
	 * 生成Token， A(hashcode>0)|B + |name的Hash值| +_+size的值
	 * @param name
	 * @param size
	 * @return
	 * @throws Exception
	 */
	public static String generateToken(String name, String size)
			throws IOException {
		if (name == null || size == null)
			return "";
		int code = name.hashCode();
		try {
			return (code > 0 ? "A" : "B") + Math.abs(code) + "_" + size.trim();
		} catch (Exception e) {
			throw new IOException(e);
		}
	}
}
