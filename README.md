# rtl-architect
Automatic verilog code generation
[access online here](https://colter5991.github.io/rtl-architect/)

# Why?

Because tools should enable us, not get in the way.
Because hardware designers waste too much time doing repetitious tasks.
Because fixing bugs generated while using current hardware tools is the most time-consuming part of building hardware.
Because while the software community has developed mature programming tools, hardware designers are still tolerating the frustrating tools of 10 years ago.
*Because building hardware shouldn't be so hard.*

### The hardware design process

While building a state machine, it is often necessary to draw a state transition diagram. The diagram includes next state and output logic in a digestible format that can be built upon and shared with other designers. To turn the diagram into hardware, the designer must codify the logic displayed in the diagram into verilog code. This is usually a tedious error-prone task that can take many hours of debugging time to achieve intended functionality. Even after the transcription process is complete, designers often find errors present in their original diagram that require them to retranscribe portions of the code. Moving back and forth from the diagram and code is exhausting and designers often cut corners by allowing for the two to become desynchronized or by forgoing the diagram altogether. This is obviously not helpful as systems become more complicated. *Errors introduced during this process are often more time consuming than actually designing the hardware in the first place.*

The transcription process can be summarized in the following steps:

1. Make a state transition diagram with some diagramming tool
2. Write verilog code by looking at the diagram
3. Update both the diagram and the code as errors are discovered
4. Update both the diagram and the code as the design is modified

RTL Architect simplifies this process into the following steps:

1. Make a state transition diagram (code automatically generated)
2. Update the diagram as the design is modified (code automatically updated)

# Can I contribute?

Yes! Please do! We welcome community support with both pull requests, feature requests, and bug reports. Please don't hesitate to jump in.

# License

MIT
