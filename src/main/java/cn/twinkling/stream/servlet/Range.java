package cn.twinkling.stream.servlet;

/**
 * 文件上传的起始位置，以及大小等属性。
 */
public class Range {
	private long from;
	private long to;
	private long size;

	public Range(long from, long to, long size) {
		this.from = from;
		this.to = to;
		this.size = size;
	}

	public long getFrom() {
		return from;
	}

	public void setFrom(long from) {
		this.from = from;
	}

	public long getTo() {
		return to;
	}

	public void setTo(long to) {
		this.to = to;
	}

	public long getSize() {
		return size;
	}

	public void setSize(long size) {
		this.size = size;
	}
}
